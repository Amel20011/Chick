import { DB } from "../../lib/database.js";
import { reply } from "../../lib/message.js";
import { requireAdmin, requireGroup } from "../../lib/permission.js";

export const command = "antipromosi";

export async function run({ sock, meta, args }) {
  requireGroup(meta);
  requireAdmin(meta);
  
  const setting = (args[0] || "").toLowerCase();
  if (!["on", "off", "list"].includes(setting)) {
    return reply(sock, meta.jid, "Usage: .antipromosi on|off|list");
  }
  
  const g = (await DB.getGroup(meta.jid)) || {};
  
  if (setting === "on" || setting === "off") {
    g.antipromosi = setting === "on";
    
    // Reset warning saat mematikan
    if (setting === "off") {
      g.warnings_promosi = {};
    }
    
    await DB.setGroup(meta.jid, g);
    await reply(sock, meta.jid, `Anti-promosi ${setting === "on" ? "diaktifkan" : "dimatikan"} 🌷`);
  } 
  else if (setting === "list") {
    // Tampilkan daftar keyword yang diblokir
    const keywords = g.promosi_keywords || ["jual", "beli", "promo", "diskon", "murah", "grosir", "order", "pesan", "dm", "wa.me", "bit.ly"];
    await reply(sock, meta.jid, `📋 *Daftar Keyword Promosi yang Diblokir:*\n\n${keywords.map(k => `• ${k}`).join('\n')}\n\nTotal: ${keywords.length} keyword`);
  }
}
