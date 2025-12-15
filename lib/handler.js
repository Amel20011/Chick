import { DB } from "../lib/database.js";

// Default keywords promosi
const DEFAULT_KEYWORDS = [
  'jual', 'beli', 'promo', 'diskon', 'grosir', 'murah', 'terbaru',
  'order', 'pesan', 'kontak', 'wa.me', 'bit.ly', 'shopee', 'tokopedia',
  'bukalapak', 'whatsapp', 'line', 'telegram', 'instagram', 'fb', 
  'facebook', 'dm', 'direct message', 'jasa', 'service', 'layanan',
  'toko online', 'marketplace', 'cod', 'cashback', 'free', 'gratis'
];

// Regex untuk nomor telepon
const PHONE_REGEX = /(\+62|62|08)(\d{8,12})/g;

// Regex untuk link umum
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

// Daftar domain marketplace populer
const MARKETPLACE_DOMAINS = [
  'shopee', 'tokopedia', 'bukalapak', 'lazada', 'blibli', 
  'olx', 'jd.id', 'elevenia', 'zalora', 'sociolla'
];

// Fungsi untuk cek admin
async function isGroupAdmin(sock, groupJid, userJid) {
  try {
    const metadata = await sock.groupMetadata(groupJid);
    const participant = metadata.participants.find(p => p.id === userJid);
    return participant && ["admin", "superadmin"].includes(participant.admin);
  } catch {
    return false;
  }
}

// Fungsi untuk mengirim pesan privat ke user
async function sendPrivateWarning(sock, userJid, groupName, warnCount, detectedKeyword) {
  try {
    const messages = [
      `⚠️ *PERINGATAN PROMOSI* ⚠️\n`,
      `Anda menerima peringatan ke-${warnCount} dari grup:`,
      `• Grup: ${groupName}`,
      `• Keyword: "${detectedKeyword}"`,
      `• Status: ${warnCount}/3 warning`,
      ``,
      `⚠️ *Jika mencapai 3 warning, Anda akan dikeluarkan otomatis!*`,
      ``,
      `📌 *Hindari kata-kata promosi seperti:*`,
      `• jual, beli, promo, diskon`,
      `• share nomor/wa.me`,
      `• link marketplace (shopee, tokopedia, dll)`,
      `• kata promosi lainnya`
    ];
    
    await sock.sendMessage(userJid, {
      text: messages.join('\n')
    });
  } catch (error) {
    console.log("Tidak bisa mengirim pesan privat:", error);
  }
}

// Plugin antipromosi utama
export default {
  // Method run akan dipanggil otomatis oleh handler.js untuk setiap pesan
  async run({ sock, config, meta }) {
    try {
      const { jid, sender, body, isGroup, key, type } = meta;
      
      // Hanya proses di grup
      if (!isGroup) return;
      
      // Lewati jika pesan tidak memiliki body (gambar, video, dll)
      if (!body || typeof body !== 'string') return;
      
      const groupJid = jid;
      const userJid = sender;
      
      // Ambil data grup dari database
      const g = await DB.getGroup(groupJid) || {};
      
      // Cek jika fitur anti-promosi aktif
      if (!g.antipromosi) return;
      
      // Cek jika pengirim adalah admin grup
      if (await isGroupAdmin(sock, groupJid, userJid)) return;
      
      // Ambil keywords dari database atau gunakan default
      const keywords = g.promosi_keywords || DEFAULT_KEYWORDS;
      const lowerBody = body.toLowerCase();
      
      let detected = false;
      let detectedKeyword = "";
      
      // 1. Cek keyword promosi dalam pesan
      for (const keyword of keywords) {
        if (lowerBody.includes(keyword.toLowerCase())) {
          detected = true;
          detectedKeyword = keyword;
          break;
        }
      }
      
      // 2. Cek nomor telepon dalam pesan
      if (!detected && PHONE_REGEX.test(body)) {
        // Cek apakah pesan juga mengandung kata promosi
        const promoWords = ['wa.', 'chat', 'dm', 'kontak', 'hubungi'];
        const hasPromoContext = promoWords.some(word => lowerBody.includes(word));
        
        if (hasPromoContext) {
          detected = true;
          detectedKeyword = "nomor telepon + promosi";
        }
      }
      
      // 3. Cek link marketplace
      if (!detected) {
        for (const domain of MARKETPLACE_DOMAINS) {
          if (lowerBody.includes(domain)) {
            detected = true;
            detectedKeyword = `link ${domain}`;
            break;
          }
        }
      }
      
      // 4. Cek link umum dengan konteks promosi
      if (!detected && URL_REGEX.test(body)) {
        // Cek apakah link disertai kata promosi
        const promoContextWords = ['order', 'pesan', 'jual', 'beli', 'promo', 'diskon'];
        const hasPromoContext = promoContextWords.some(word => lowerBody.includes(word));
        
        if (hasPromoContext) {
          detected = true;
          detectedKeyword = "link + kata promosi";
        }
      }
      
      // Jika terdeteksi promosi
      if (detected) {
        // Hapus pesan yang mengandung promosi
        try {
          await sock.sendMessage(groupJid, { delete: key });
          console.log(`Pesan promosi dihapus dari ${groupJid} oleh ${userJid}`);
        } catch (error) {
          console.log("Gagal menghapus pesan:", error);
        }
        
        // Inisialisasi warning system
        if (!g.warnings_promosi) g.warnings_promosi = {};
        if (!g.warnings_promosi[userJid]) {
          g.warnings_promosi[userJid] = {
            count: 0,
            lastWarn: null,
            keywords: []
          };
        }
        
        // Tambah warning count
        g.warnings_promosi[userJid].count += 1;
        g.warnings_promosi[userJid].lastWarn = new Date().toISOString();
        g.warnings_promosi[userJid].keywords.push(detectedKeyword);
        
        const warnCount = g.warnings_promosi[userJid].count;
        
        // Simpan perubahan ke database
        await DB.setGroup(groupJid, g);
        
        // Dapatkan nama grup untuk pesan
        let groupName = "Grup";
        try {
          const metadata = await sock.groupMetadata(groupJid);
          groupName = metadata.subject;
        } catch (error) {
          console.log("Gagal mendapatkan metadata grup:", error);
        }
        
        // Kirim peringatan privat ke user
        await sendPrivateWarning(sock, userJid, groupName, warnCount, detectedKeyword);
        
        // Jika belum 3x warning
        if (warnCount < 3) {
          // Kirim warning di grup
          await sock.sendMessage(groupJid, {
            text: `⚠️ *WARNING ANTI-PROMOSI*\n\n` +
                  `@${userJid.split('@')[0]} - Warning ${warnCount}/3\n` +
                  `Pesan dengan kata "${detectedKeyword}" telah dihapus.\n` +
                  `Total pelanggaran: ${warnCount}x\n\n` +
                  `ℹ️ Cek pesan privat dari bot untuk detail.`,
            mentions: [userJid]
          });
        } 
        // Jika sudah 3x warning
        else {
          // Kick member dari grup
          try {
            await sock.groupParticipantsUpdate(groupJid, [userJid], "remove");
            console.log(`User ${userJid} dikick dari ${groupJid} karena promosi 3x`);
          } catch (error) {
            console.log("Gagal mengeluarkan user:", error);
            // Jika gagal kick, tetap beri tahu admin
            await sock.sendMessage(groupJid, {
              text: `🚫 *GAGAL MENGELUARKAN*\n\n` +
                    `@${userJid.split('@')[0]} sudah 3x melanggar aturan promosi,\n` +
                    `tetapi bot tidak memiliki izin untuk mengeluarkan.\n` +
                    `Silahkan keluarkan secara manual.`,
              mentions: [userJid]
            });
            return;
          }
          
          // Kirim pesan final ke user
          try {
            await sock.sendMessage(userJid, {
              text: `🚫 *ANDA TELAH DIKELUARKAN DARI GRUP*\n\n` +
                    `• Grup: ${groupName}\n` +
                    `• Alasan: Pelanggaran aturan promosi 3x\n` +
                    `• Keyword terakhir: "${detectedKeyword}"\n` +
                    `• Tanggal: ${new Date().toLocaleString('id-ID')}\n\n` +
                    `📞 Hubungi admin grup untuk penjelasan lebih lanjut.\n` +
                    `⏰ Masa tenggang: 24 jam sebelum bisa bergabung kembali.`
            });
          } catch (error) {
            console.log("Gagal mengirim pesan final ke user:", error);
          }
          
          // Beri tahu di grup bahwa user telah dikeluarkan
          await sock.sendMessage(groupJid, {
            text: `🚫 *PELANGGAR PROMOSI DIKELUARKAN*\n\n` +
                  `@${userJid.split('@')[0]} telah dikeluarkan karena:\n` +
                  `• 3x pelanggaran aturan promosi\n` +
                  `• Keyword: ${g.warnings_promosi[userJid].keywords.join(', ')}\n\n` +
                  `🛡️ Fitur anti-promosi aktif untuk menjaga grup tetap nyaman.`,
            mentions: [userJid]
          });
          
          // Reset warning untuk user ini setelah dikick
          delete g.warnings_promosi[userJid];
          await DB.setGroup(groupJid, g);
        }
      }
    } catch (error) {
      console.error("Error in antipromosi plugin:", error);
    }
  }
};
