import { DB } from "../../lib/database.js";
import { reply } from "../../lib/message.js";

export const command = "menu";

export async function run({ sock, meta, args }) {
  const userJid = meta.sender;
  
  // Cek apakah user sudah terdaftar (untuk private chat)
  if (!meta.isGroup) {
    const userData = await DB.getUser(userJid) || {};
    if (!userData.registered) {
      return reply(sock, meta.jid, 
        "❌ Kamu belum terdaftar!\n\n" +
        "Silahkan klik button Daftar terlebih dahulu untuk menggunakan menu."
      );
    }
  }
  
  // Tampilkan menu utama
  const menuText = 
    `📱 *MENU BOT CHICK* 📱\n\n` +
    `╭─❏ *GROUP COMMANDS*\n` +
    `│ • .antilinkall on/off\n` +
    `│ • .antipromosi on/off\n` +
    `│ • .welcome on/off\n` +
    `│ • .group open/close\n` +
    `╰─────────────\n\n` +
    `╭─❏ *MAIN COMMANDS*\n` +
    `│ • .menu\n` +
    `│ • .owner\n` +
    `│ • .ping\n` +
    `│ • .status\n` +
    `╰─────────────\n\n` +
    `╭─❏ *OTHER*\n` +
    `│ • .daftar (untuk private)\n` +
    `│ • .help\n` +
    `╰─────────────\n\n` +
    `🌸 Bot created by Amel20011 🌸`;
  
  await reply(sock, meta.jid, menuText);
}
