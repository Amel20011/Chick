export const command = "unblock";

export async function run({ sock, meta, args }) {
  const num = (args[0] || "").replace(/[^\d]/g, "");
  if (!num) return sock.sendMessage(meta.jid, { text: "Usage: .unblock 62xxxxxxxxxx" });
  await sock.updateBlockStatus(`${num}@s.whatsapp.net`, "unblock");
  await sock.sendMessage(meta.jid, { text: `Unblocked @${num}` });
}
