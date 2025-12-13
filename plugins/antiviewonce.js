export default {
  name: "antiviewonce",
  async run({ sock, meta }) {
    const msg = meta.m.message;
    const v1 = msg?.viewOnceMessageV2 || msg?.viewOnceMessage || null;
    if (!v1) return;

    const inner = v1.message;
    // re-send content without viewOnce
    await sock.sendMessage(meta.jid, {
      forward: inner
    });
    await sock.sendMessage(meta.jid, { text: `⋆.𐙚 View-once content was revealed ᥫ᭡` });
  }
};
