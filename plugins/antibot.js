export default {
  name: "antibot",
  async run({ sock, meta }) {
    if (!meta.isGroup) return;
    const text = meta.text || "";
    // naive detection: if message looks like command spam within 1 sec bursts
    // handled by antispam; antibot can flag known bot signatures
    const signatures = ["›", "•", "BOT", "bot", "menu bot", "prefix"];
    if (signatures.some(s => text.toLowerCase().includes(s))) {
      // soft notice
      await sock.sendMessage(meta.jid, { text: `☘️ Anti-bot notice: avoid bot spam here, thanks ᥫ᭡` });
    }
  }
};
