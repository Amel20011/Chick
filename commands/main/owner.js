import { reply } from "../../lib/message.js";

export const command = "owner";

export async function run({ sock, meta, args }) {
  const ownerInfo = 
    `👑 *OWNER BOT* 👑\n\n` +
    `• Nama: Amel\n` +
    `• Instagram: @amel20011\n` +
    `• GitHub: ameliachantika\n` +
    `• Nomor: 6281234567890\n\n` +
    `🌸 *BUTTON OWNER:*\n` +
    `Klik button di bawah untuk langsung chat owner!`;
  
  await reply(sock, meta.jid, ownerInfo);
}
