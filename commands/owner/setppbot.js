import { reply } from "../../lib/message.js";
import { requireOwner } from "../../lib/permission.js";

export const command = "setppbot";

export async function run({ sock, meta }) {
  requireOwner(meta.sender);
  const q = meta.m.message?.imageMessage || meta.m.message?.extendedTextMessage?.contextInfo;
  if (!q) return reply(sock, meta.jid, "Reply an image with .setppbot");
  const id = meta.m.message?.extendedTextMessage?.contextInfo?.stanzaId;
  const msg = await sock.loadMessage(meta.jid, id);
  const image = msg?.message?.imageMessage;
  if (!image) return reply(sock, meta.jid, "No image found.");
  await sock.updateProfilePicture(sock.user.id, image);
  await reply(sock, meta.jid, "Profile updated 🌷");
}
