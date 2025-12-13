export const command = "hidetag";

export async function run({ sock, meta, args }) {
  const text = args.join(" ").trim() || "𓂃 Hidden tag";
  const metaData = await sock.groupMetadata(meta.jid);
  const mentions = metaData.participants.map(p => p.id);
  await sock.sendMessage(meta.jid, { text, mentions });
}
