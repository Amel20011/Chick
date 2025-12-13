import { reply } from "../../lib/message.js";

export const command = "tagall";

export async function run({ sock, meta }) {
  const metaData = await sock.groupMetadata(meta.jid);
  const mentions = metaData.participants.map(p => p.id);
  await sock.sendMessage(meta.jid, { text: "ᯓᡣ𐭩 Tagging all members 🌷", mentions });
}
