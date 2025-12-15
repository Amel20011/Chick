import { DB } from "../lib/database.js";

// Regex untuk mendeteksi SEMUA jenis link
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|t\.me\/[^\s]+|instagram\.com\/[^\s]+|facebook\.com\/[^\s]+|twitter\.com\/[^\s]+|youtube\.com\/[^\s]+|youtu\.be\/[^\s]+|wa\.me\/[^\s]+|bit\.ly\/[^\s]+|goo\.gl\/[^\s]+|tinyurl\.com\/[^\s]+|[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/gi;

// Plugin antilinkall
export default {
  async run({ sock, config, meta }) {
    try {
      // Hanya proses di grup
      if (!meta.isGroup) return;
      
      const groupJid = meta.jid;
      const userJid = meta.sender;
      const body = meta.body;
      const key = meta.key;
      
      // Update group last active
      await DB.updateGroupLastActive(groupJid);
      
      // Ambil data grup
      const g = await DB.getGroup(groupJid) || {};
      
      // Cek jika fitur aktif
      if (!g.antilinkall) return;
      
      // Skip jika pengirim admin
      if (meta.isAdmin) return;
      
      // Cek apakah ada body
      if (!body || typeof body !== 'string') return;
      
      // Cek apakah pesan mengandung link
      if (URL_REGEX.test(body)) {
        // Reset regex untuk pencarian selanjutnya
        URL_REGEX.lastIndex = 0;
        const links = body.match(URL_REGEX);
        
        // Hapus pesan yang mengandung link
        try {
          await sock.sendMessage(groupJid, { delete: key });
        } catch (error) {
          console.log("Gagal menghapus pesan antilinkall:", error);
        }
        
        // Inisialisasi warnings di data group
        if (!g.warnings_link) g.warnings_link = {};
        if (!g.warnings_link[userJid]) g.warnings_link[userJid] = 0;
        
        // Tambah warning
        g.warnings_link[userJid] += 1;
        const warnCount = g.warnings_link[userJid];
        
        await DB.setGroup(groupJid, g);
        
        // Jika belum 3x warning
        if (warnCount < 3) {
          const linkCount = links ? links.length : 1;
          const linkPreview = links && links.length <= 3 ? 
            `\nLink: ${links.slice(0, 3).map(l => l.substring(0, 30) + (l.length > 30 ? '...' : '')).join(', ')}` : 
            `\n${linkCount} link terdeteksi`;
          
          await sock.sendMessage(groupJid, {
            text: `⚠️ *Warning Link All Blocked*\n\n@${userJid.split('@')[0]} - Warn ${warnCount}/3${linkPreview}\nPesan telah dihapus otomatis.`,
            mentions: [userJid]
          });
        } 
        // Jika sudah 3x warning
        else {
          // Kick member
          await sock.groupParticipantsUpdate(groupJid, [userJid], "remove");
          
          // Dapatkan nama grup
          let groupName = "Grup";
          try {
            const metadata = await sock.groupMetadata(groupJid);
            groupName = metadata.subject;
          } catch (error) {
            console.log("Gagal mendapatkan metadata grup:", error);
          }
          
          // Kirim pesan privat dengan button
          try {
            await sock.sendMessage(userJid, {
              text: `🚫 *Anda telah dikeluarkan dari grup*\n\n• Grup: ${groupName}\n• Kesalahan: Mengirim link sebanyak 3x\n• Tanggal: ${new Date().toLocaleString('id-ID')}\n\nSilahkan pilih opsi di bawah:`,
              footer: "Sistem Anti-link All",
              templateButtons: [
                {
                  index: 1,
                  urlButton: {
                    displayText: "📞 Hubungi Owner",
                    url: "https://wa.me/6281234567890" // Ganti dengan nomor owner
                  }
                },
                {
                  index: 2,
                  quickReplyButton: {
                    displayText: "📋 Detail Kesalahan",
                    id: "detail_link"
                  }
                }
              ]
            });
          } catch (error) {
            console.log("Tidak bisa mengirim pesan privat:", error);
          }
          
          // Reset warning setelah dikick
          delete g.warnings_link[userJid];
          await DB.setGroup(groupJid, g);
          
          // Beri tahu di grup
          await sock.sendMessage(groupJid, {
            text: `🚫 @${userJid.split('@')[0]} telah dikeluarkan karena melanggar aturan anti-link all sebanyak 3x.`,
            mentions: [userJid]
          });
        }
      }
    } catch (error) {
      console.error("Error in antilinkall plugin:", error);
    }
  }
};
