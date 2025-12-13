export default {
  name: "poll",
  async run({ sock, meta }) {
    const text = meta.text || "";
    if (!text.toLowerCase().startsWith("/poll ")) return;
    const body = text.slice(6).trim();
    const [title, ...opts] = body.split("|").map(s => s.trim()).filter(Boolean);
    if (!title || opts.length < 2) {
      await sock.sendMessage(meta.jid, { text: "Usage: /poll Title | Option A | Option B [| Option C]" });
      return;
    }
    await sock.sendMessage(meta.jid, {
      poll: {
        name: title,
        selectableOptionsCount: 1,
        options: opts
      }
    });
  }
};
