export default {
  name: "antidelete",
  async onDelete({ sock, update }) {
    const jid = update.key.remoteJid;
    const id = update.key.id;
    const cached = sock.msgStore.get(id);
    if (!cached) return;
    await sock.sendMessage(jid, {
      text: `𓂃 A message was deleted, but I saw it 💗\n• From: @${(cached.key.participant || cached.key.remoteJid).split("@")[0]}\n• Type: ${Object.keys(cached.message || {})[0]}`,
      mentions: [cached.key.participant || cached.key.remoteJid]
    });
  },
  async run() {}
};
