export const command = "delete";

export async function run({ sock, meta }) {
  const quoted = meta.m.message?.extendedTextMessage?.contextInfo?.stanzaId;
  const participant = meta.m.message?.extendedTextMessage?.contextInfo?.participant;
  if (!quoted) {
    return sock.sendMessage(meta.jid, { text: "Reply a message with .delete" });
  }
  await sock.sendMessage(meta.jid, { delete: { id: quoted, remoteJid: meta.jid, fromMe: false } });
}
