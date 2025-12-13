import { DB } from "../lib/database.js";
import config from "../config.js";

const INVITE_REGEX = /(chat\.whatsapp\.com\/|wa\.me\/)/i;

export default {
  name: "antilink",
  async run({ sock, meta }) {
    if (!meta.isGroup) return;
    const text = meta.text || "";
    if (!INVITE_REGEX.test(text)) return;

    const g = (await DB.getGroup(meta.jid)) || { antilink: config.antilink.enabledByDefault, warns: {} };
    if (!g.antilink) return;

    const warns = g.warns || {};
    const count = (warns[meta.sender] || 0) + 1;
    warns[meta.sender] = count;
    g.warns = warns;
    await DB.setGroup(meta.jid, g);

    await sock.sendMessage(meta.jid, {
      text: `🌹 Anti-link active.\nWarn ${count}/${config.antilink.warnLimit} for @${meta.sender.split("@")[0]}`,
      mentions: [meta.sender]
    });

    if (count >= config.antilink.warnLimit && config.antilink.kickOnLimit) {
      await sock.groupParticipantsUpdate(meta.jid, [meta.sender], "remove");
      if (config.antilink.notifyDM) {
        await sock.sendMessage(meta.sender, { text: `You were removed for posting links. Be mindful 🌷` });
      }
    }
  }
};
