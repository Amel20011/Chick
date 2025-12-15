import { DB } from "../lib/database.js";

// Default keywords promosi
const DEFAULT_KEYWORDS = [
  'jual', 'beli', 'promo', 'diskon', 'grosir', 'murah', 'terbaru',
  'order', 'pesan', 'kontak', 'wa.me', 'bit.ly', 'shopee', 'tokopedia',
  'bukalapak', 'whatsapp', 'line', 'telegram', 'instagram', 'fb', 
  'facebook', 'dm', 'direct message', 'jasa', 'service', 'layanan'
];

// Regex untuk nomor telepon
const PHONE_REGEX = /(\+62|62|08)(\d{8,12})/g;

export async function antipromosiHandler(sock, message) {
  try {
    const { jid, sender, body, isGroup, key } = message;
    
    if (!isGroup) return;
    
    const groupJid = jid;
    const userJid = sender;
    
    // Ambil data grup
    const g = await DB.getGroup(groupJid) || {};
    
    // Cek jika fitur aktif
    if (!g.antipromosi) return;
    
    // Cek jika pengirim admin
    const metadata = await sock.groupMetadata(groupJid);
    const participant = metadata.participants.find(p => p.id === userJid);
    if (participant && ["admin", "superadmin"].includes(participant.admin)) return;
    
    // Ambil keywords dari database atau gunakan default
    const keywords = g.promosi_keywords || DEFAULT_KEYWORDS;
    const lowerBody = body.toLowerCase();
    
    let detected = false;
    let detectedKeyword = "";
    
    // Cek keyword promosi
    for (const keyword of keywords) {
      if (lowerBody.includes(keyword.toLowerCase())) {
        detected = true;
        detectedKeyword = keyword;
        break;
      }
    }
    
    // Cek nomor telepon
    if (!detected && PHONE_REGEX.test(body)) {
      detected = true;
      detectedKeyword = "nomor telepon";
    }
    
    // Cek link marketplace
    if (!detected) {
      const marketplaceDomains = ['shopee', 'tokopedia', 'bukalapak', 'lazada', 'blibli', 'olx'];
      for (const domain of marketplaceDomains) {
        if (lowerBody.includes(domain)) {
          detected = true;
          detectedKeyword = `link ${domain}`;
          break;
        }
      }
    }
    
    if (detected) {
      // Hapus pesan
      try {
        await sock.sendMessage(groupJid, { delete: key });
      } catch (error) {
        console.log("Gagal menghapus pesan:", error);
      }
      
      // Inisialisasi warnings
      if (!g.warnings_promosi) g.warnings_promosi = {};
      if (!g.warnings_promosi[userJid]) g.warnings_promosi[userJid] = 0;
      
      // Tambah warning
      g.warnings_promosi[userJid] += 1;
      const warnCount = g.warnings_promosi[userJid];
      
      await DB.setGroup(groupJid, g);
      
      // Jika belum 3x warning
      if (warnCount < 3) {
        await sock.sendMessage(groupJid, {
          text: `⚠️ *Warning Promosi Blocked*\n\n@${userJid.split('@')[0]} - Warn ${warnCount}/3\nKeyword terdeteksi: "${detectedKeyword}"\nPesan telah dihapus otomatis.`,
          mentions: [userJid]
        });
      } 
      // Jika sudah 3x warning
      else {
        // Kick member
        await sock.groupParticipantsUpdate(groupJid, [userJid], "remove");
        
        // Kirim pesan privat
        const privateMessage = {
          text: `🚫 *Anda telah dikeluarkan dari grup*\n\nGrup: ${metadata.subject}\nAlasan: Promosi sebanyak 3x\n\n📞 Hubungi admin grup jika ingin bergabung kembali.`,
          footer: "Sistem Anti-Promosi"
        };
        
        try {
          await sock.sendMessage(userJid, privateMessage);
        } catch (error) {
          console.log("Tidak bisa mengirim pesan privat:", error);
        }
        
        // Reset warning setelah dikick
        delete g.warnings_promosi[userJid];
        await DB.setGroup(groupJid, g);
        
        // Beri tahu di grup
        await sock.sendMessage(groupJid, {
          text: `🚫 @${userJid.split('@')[0]} telah dikeluarkan karena melanggar aturan anti-promosi sebanyak 3x.`,
          mentions: [userJid]
        });
      }
    }
  } catch (error) {
    console.error("Error in antipromosiHandler:", error);
  }
}

export default antipromosiHandler;
