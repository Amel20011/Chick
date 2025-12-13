import { isCommand, parseCommand, aestheticWrap } from "./utils.js";
import config from "../config.js";

export function shapeMeta(sock, m) {
  const jid = m.key.remoteJid;
  const isGroup = jid.endsWith("@g.us");
  const sender = m.key.participant || m.key.remoteJid;
  const text = m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.buttonsResponseMessage?.selectedDisplayText ||
    m.message?.templateButtonReplyMessage?.selectedDisplayText ||
    "";
  return { jid, isGroup, sender, text, m };
}

export function extractCommand(meta) {
  const prefix = isCommand(meta.text, config.prefix);
  if (!prefix) return null;
  return parseCommand(meta.text, prefix);
}

export function reply(sock, jid, text, options = {}) {
  return sock.sendMessage(jid, {
    text,
    ...options
  });
}

export function cuteMenu(title, items) {
  const body = items.map(i => `ᯓᡣ𐭩 ${i}`).join("\n");
  return aestheticWrap(title, body, config.aesthetic.icons, config.aesthetic.emojis);
}
