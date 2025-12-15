import { DB } from "../../lib/database.js";
import { reply } from "../../lib/message.js";
import { requireAdmin, requireGroup } from "../../lib/permission.js";

export const command = "antilinkall";

export async function run({ sock, meta, args }) {
  requireGroup(meta);
  requireAdmin(meta);
  
  const setting = (args[0] || "").toLowerCase();
  const subCommand = (args[1] || "").toLowerCase();
  
  if (!["on", "off", "list", "status", "resetwarn"].includes(setting)) {
    return reply(sock, meta.jid, 
      "📋 *Usage Anti-link All:*\n\n" +
      "• `.antilinkall on` - Aktifkan fitur (blokir SEMUA link)\n" +
      "• `.antilinkall off` - Nonaktifkan fitur\n" +
      "• `.antilinkall status` - Lihat status & warning\n" +
      "• `.antilinkall list` - Lihat daftar user yang di-warning\n" +
      "• `.antilinkall resetwarn @user` - Reset warning user\n" +
      "• `.antilinkall resetwarn all` - Reset semua warning\n\n" +
      "⚠️ *Fitur ini akan memblokir SEMUA jenis link!*"
    );
  }
  
  const g = (await DB.getGroup(meta.jid)) || {};
  
  if (setting === "on") {
    g.antilinkall = true;
    await DB.setGroup(meta.jid, g);
    return reply(sock, meta.jid, 
      "✅ *Anti-link All diaktifkan!* 🌷\n\n" +
      "Bot akan memblokir SEMUA jenis link:\n" +
      "• http://, https://\n" +
      "• www.website.com\n" +
      "• wa.me, bit.ly, dll.\n" +
      "• Instagram, Facebook, Twitter\n" +
      "• YouTube, Telegram, dll.\n\n" +
      "Sistem: 3x warning → Kick otomatis"
    );
  }
  
  if (setting === "off") {
    g.antilinkall = false;
    // Reset warning saat mematikan
    if (g.warnings_link) {
      g.warnings_link = {};
    }
    await DB.setGroup(meta.jid, g);
    return reply(sock, meta.jid, "✅ Anti-link All dimatikan! 🌷");
  }
  
  if (setting === "status") {
    const status = g.antilinkall ? "🟢 AKTIF" : "🔴 NON-AKTIF";
    const warningCount = g.warnings_link ? Object.keys(g.warnings_link).length : 0;
    const totalWarnings = g.warnings_link ? Object.values(g.warnings_link).reduce((a, b) => a + b, 0) : 0;
    
    let statusMsg = `📊 *Status Anti-link All*\n\n`;
    statusMsg += `• Status: ${status}\n`;
    statusMsg += `• User di-warning: ${warningCount} orang\n`;
    statusMsg += `• Total warning: ${totalWarnings}\n\n`;
    
    if (warningCount > 0) {
      statusMsg += `*Top 5 User dengan Warning:*\n`;
      const sortedWarnings = Object.entries(g.warnings_link)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      sortedWarnings.forEach(([user, count], index) => {
        const username = user.split('@')[0];
        const level = count >= 3 ? "🚫" : count === 2 ? "⚠️" : "🔸";
        statusMsg += `${index + 1}. @${username} - ${count}x ${level}\n`;
      });
    }
    
    return reply(sock, meta.jid, statusMsg);
  }
  
  if (setting === "list") {
    if (!g.warnings_link || Object.keys(g.warnings_link).length === 0) {
      return reply(sock, meta.jid, "📋 Tidak ada user yang memiliki warning link.");
    }
    
    const warningsList = Object.entries(g.warnings_link)
      .sort((a, b) => b[1] - a[1])
      .map(([user, count], index) => {
        const username = user.split('@')[0];
        const level = count >= 3 ? "🚫 (Siap Kick)" : count === 2 ? "⚠️ (1x lagi)" : "🔸";
        return `${index + 1}. @${username} - ${count} warning ${level}`;
      })
      .join('\n');
    
    return reply(sock, meta.jid, 
      `📋 *Daftar Warning Link All:*\n\n${warningsList}\n\n` +
      `Total: ${Object.keys(g.warnings_link).length} user\n` +
      `Gunakan: .antilinkall resetwarn @user`
    );
  }
  
  if (setting === "resetwarn") {
    if (args.length < 2) {
      return reply(sock, meta.jid, 
        "Usage:\n" +
        "• `.antilinkall resetwarn @user` - Reset warning user tertentu\n" +
        "• `.antilinkall resetwarn all` - Reset semua warning"
      );
    }
    
    const target = args[1];
    
    if (target === "all") {
      if (!g.warnings_link || Object.keys(g.warnings_link).length === 0) {
        return reply(sock, meta.jid, "❌ Tidak ada warning yang bisa direset.");
      }
      
      const count = Object.keys(g.warnings_link).length;
      g.warnings_link = {};
      await DB.setGroup(meta.jid, g);
      
      return reply(sock, meta.jid, `✅ Semua warning (${count} user) telah direset!`);
    }
    
    // Reset warning user tertentu
    const mentioned = meta.mentionedJid;
    if (!mentioned || mentioned.length === 0) {
      return reply(sock, meta.jid, "❌ Tag user yang ingin direset warning-nya!");
    }
    
    const targetUser = mentioned[0];
    
    if (g.warnings_link && g.warnings_link[targetUser]) {
      const warnCount = g.warnings_link[targetUser];
      delete g.warnings_link[targetUser];
      await DB.setGroup(meta.jid, g);
      
      return reply(sock, meta.jid, 
        `✅ ${warnCount} warning untuk @${targetUser.split('@')[0]} telah direset.`,
        { mentions: [targetUser] }
      );
    } else {
      return reply(sock, meta.jid, 
        `❌ @${targetUser.split('@')[0]} tidak memiliki warning.`,
        { mentions: [targetUser] }
      );
    }
  }
}
