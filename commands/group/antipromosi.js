import { DB } from "../../lib/database.js";
import { reply } from "../../lib/message.js";
import { requireAdmin, requireGroup } from "../../lib/permission.js";

const DEFAULT_KEYWORDS = [
  'jual', 'beli', 'promo', 'diskon', 'grosir', 'murah', 'terbaru',
  'order', 'pesan', 'kontak', 'wa.me', 'bit.ly', 'shopee', 'tokopedia',
  'bukalapak', 'whatsapp', 'line', 'telegram', 'instagram', 'fb', 
  'facebook', 'dm', 'direct message', 'jasa', 'service', 'layanan'
];

export const command = "antipromosi";

export async function run({ sock, meta, args }) {
  requireGroup(meta);
  requireAdmin(meta);
  
  const setting = (args[0] || "").toLowerCase();
  const subCommand = (args[1] || "").toLowerCase();
  
  if (!["on", "off", "list", "add", "remove", "reset"].includes(setting)) {
    return reply(sock, meta.jid, 
      "📋 *Usage Anti-Promosi:*\n\n" +
      "• `.antipromosi on` - Aktifkan fitur\n" +
      "• `.antipromosi off` - Nonaktifkan fitur\n" +
      "• `.antipromosi list` - Lihat daftar keywords\n" +
      "• `.antipromosi add jual,beli` - Tambah keywords\n" +
      "• `.antipromosi remove jual` - Hapus keywords\n" +
      "• `.antipromosi reset` - Reset ke default\n\n" +
      "Default keywords: jual, beli, promo, diskon, dll."
    );
  }
  
  const g = (await DB.getGroup(meta.jid)) || {};
  
  if (setting === "on") {
    g.antipromosi = true;
    await DB.setGroup(meta.jid, g);
    return reply(sock, meta.jid, "✅ Anti-promosi diaktifkan! 🌷");
  }
  
  if (setting === "off") {
    g.antipromosi = false;
    // Reset warning saat mematikan
    if (g.warnings_promosi) {
      g.warnings_promosi = {};
    }
    await DB.setGroup(meta.jid, g);
    return reply(sock, meta.jid, "✅ Anti-promosi dimatikan! 🌷");
  }
  
  if (setting === "list") {
    const keywords = g.promosi_keywords || DEFAULT_KEYWORDS;
    const chunkSize = 10;
    let response = `📋 *Daftar Keyword Promosi (${keywords.length}):*\n\n`;
    
    for (let i = 0; i < keywords.length; i += chunkSize) {
      const chunk = keywords.slice(i, i + chunkSize);
      response += chunk.map((k, idx) => `${i + idx + 1}. ${k}`).join('\n');
      if (i + chunkSize < keywords.length) response += "\n\n...";
    }
    
    return reply(sock, meta.jid, response);
  }
  
  if (setting === "add" && args.length > 1) {
    const keywordsToAdd = args.slice(1).join(" ").split(",")
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);
    
    if (keywordsToAdd.length === 0) {
      return reply(sock, meta.jid, "❌ Berikan keyword yang ingin ditambahkan!\nContoh: `.antipromosi add jual,beli`");
    }
    
    const currentKeywords = g.promosi_keywords || DEFAULT_KEYWORDS;
    const updatedKeywords = [...new Set([...currentKeywords, ...keywordsToAdd])];
    
    g.promosi_keywords = updatedKeywords;
    await DB.setGroup(meta.jid, g);
    
    return reply(sock, meta.jid, 
      `✅ *${keywordsToAdd.length} keyword ditambahkan!*\n\n` +
      `Keywords: ${keywordsToAdd.join(', ')}\n` +
      `Total: ${updatedKeywords.length} keywords\n\n` +
      `Gunakan: .antipromosi list untuk melihat semua`
    );
  }
  
  if (setting === "remove" && args.length > 1) {
    const keywordsToRemove = args.slice(1).join(" ").split(",")
      .map(k => k.trim().toLowerCase());
    
    if (keywordsToRemove.length === 0) {
      return reply(sock, meta.jid, "❌ Berikan keyword yang ingin dihapus!\nContoh: `.antipromosi remove jual`");
    }
    
    const currentKeywords = g.promosi_keywords || DEFAULT_KEYWORDS;
    const updatedKeywords = currentKeywords.filter(k => !keywordsToRemove.includes(k));
    
    // Jika kosong, kembali ke default
    if (updatedKeywords.length === 0) {
      updatedKeywords.push(...DEFAULT_KEYWORDS);
    }
    
    g.promosi_keywords = updatedKeywords;
    await DB.setGroup(meta.jid, g);
    
    return reply(sock, meta.jid,
      `✅ *${keywordsToRemove.length} keyword dihapus!*\n\n` +
      `Keywords dihapus: ${keywordsToRemove.join(', ')}\n` +
      `Total: ${updatedKeywords.length} keywords tersisa`
    );
  }
  
  if (setting === "reset") {
    g.promosi_keywords = DEFAULT_KEYWORDS;
    await DB.setGroup(meta.jid, g);
    
    return reply(sock, meta.jid,
      `🔄 *Keywords direset ke default!*\n\n` +
      `Total: ${DEFAULT_KEYWORDS.length} keywords\n` +
      `Gunakan: .antipromosi list untuk melihat semua`
    );
  }
}
