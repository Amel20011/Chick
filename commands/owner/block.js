export const command = "block";

export async function run({ sock, meta, args }) {
  const num = (args[0] || "").replace(/[^\d]/g, "");
  if (!num) return sock.sendMessage(meta.jid, { text: "Usage: .block 62xxxxxxxxxx" });
  await sock.updateBlockStatus(`${num}@s.whatsapp.net`, "block");
  await sock.sendMessage(meta.jid, { text: `Blocked @${num}` });
}
