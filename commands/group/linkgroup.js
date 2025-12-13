import { reply } from "../../lib/message.js";

export const command = "linkgroup";

export async function run({ sock, meta }) {
  const res = await sock.groupInviteCode(meta.jid);
  await reply(sock, meta.jid, `Group link: https://chat.whatsapp.com/${res}`);
}
