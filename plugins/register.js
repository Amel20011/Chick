import { DB } from "../lib/database.js";

// Plugin untuk pendaftaran user
export default {
  async run({ sock, config, meta }) {
    try {
      // Hanya proses di private chat (bukan grup)
      if (meta.isGroup) return;
      
      const userJid = meta.sender;
      const body = meta.body || "";
      
      // Update last seen
      await DB.updateUserLastSeen(userJid);
      
      // Ambil data user
      const userData = await DB.getUser(userJid) || {};
      
      // Jika user belum terdaftar dan mengirim pesan pertama (bukan perintah)
      if (!userData.registered && !body.startsWith('.')) {
        // Cek apakah sudah pernah dikirim pesan daftar
        if (!userData.daftarSent) {
          // Kirim pesan dengan button untuk daftar
          await sock.sendMessage(userJid, {
            text: `🌸 ʜᴀʟᴏ @${userJid.split('@')[0]} 🌸\nʏᴏᴜ ʙᴇʟᴜᴍ ᴛᴇʀᴅᴀꜰᴛᴀʀ ɴɪʜ 💗\nᴋʟɪᴋ ʟɪsᴛ ᴍᴇssᴀɢᴇ ʙᴜᴛᴛᴏɴ ᴅɪ ʙᴀᴡᴀʜ 🌷\nᴅᴀɴ ᴋʟɪᴋ ᴅᴀꜰᴛᴀʀ ʏᴀ 🌹🦋`,
            mentions: [userJid],
            templateButtons: [
              {
                index: 1,
                quickReplyButton: {
                  displayText: "🌸 Daftar",
                  id: "daftar_user"
                }
              },
              {
                index: 2,
                urlButton: {
                  displayText: "📞 Owner",
                  url: "https://wa.me/6281234567890" // Ganti dengan nomor owner
                }
              }
            ]
          });
          
          // Simpan bahwa sudah dikirim pesan daftar
          await DB.setUser(userJid, { daftarSent: true });
        }
      }
      
      // Tangani jika user klik button daftar
      if (body === "daftar_user") {
        // Proses pendaftaran
        await DB.setUser(userJid, {
          registered: true,
          registeredAt: new Date().toISOString(),
          name: meta.pushName || "User",
          phone: userJid.split('@')[0]
        });
        
        // Kirim konfirmasi
        await sock.sendMessage(userJid, {
          text: `🎉 *Selamat, pendaftaran berhasil!*\n\n• Nama: ${meta.pushName || "User"}\n• ID: ${userJid.split('@')[0]}\n• Tanggal: ${new Date().toLocaleDateString('id-ID')}\n\nSekarang kamu bisa menggunakan semua fitur bot. 🥳`
        });
      }
      
      // Tangani jika user mengirim perintah .daftar
      if (body === '.daftar') {
        await DB.setUser(userJid, {
          registered: true,
          registeredAt: new Date().toISOString(),
          name: meta.pushName || "User",
          phone: userJid.split('@')[0]
        });
        
        await sock.sendMessage(userJid, {
          text: `🎉 *Pendaftaran berhasil!*\n\nSelamat datang di bot kami! 🥳\n\nGunakan .menu untuk melihat daftar perintah.`
        });
      }
      
    } catch (error) {
      console.error("Error in register plugin:", error);
    }
  }
};
