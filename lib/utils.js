import fs from "fs";
import fse from "fs-extra";
import path from "path";

const filesToEnsure = [
  "./database/users.json",
  "./database/groups.json",
  "./database/premium.json",
  "./logs/error.log",
  "./session/session"
];

export async function ensureFiles() {
  for (const p of filesToEnsure) {
    await fse.ensureFile(p);
    const ext = path.extname(p);
    if (ext === ".json" && (await fse.readFile(p, "utf8")).trim() === "") {
      await fse.writeFile(p, "{}", "utf8");
    }
  }
  // media placeholders
  for (const img of ["./media/menu.jpg", "./media/welcome.jpg", "./media/qris.jpg"]) {
    await fse.ensureFile(img);
  }
}

export function logError(err) {
  const line = `[${new Date().toISOString()}] ${err?.stack || err}\n`;
  fs.appendFileSync("./logs/error.log", line);
}

export function isCommand(text, prefixes) {
  if (!text) return null;
  for (const p of prefixes) {
    if (text.startsWith(p)) return p;
  }
  return null;
}

export function parseCommand(text, prefix) {
  const raw = text.slice(prefix.length).trim();
  const [cmd, ...args] = raw.split(/\s+/);
  return { cmd: cmd.toLowerCase(), args };
}

export async function sendButtonImage(sock, jid, filePath, caption, footer, buttons) {
  const templateButtons = buttons.map((b, i) => {
    if (b.type === "url") return { index: i + 1, urlButton: { displayText: b.text, url: b.url } };
    if (b.type === "call") return { index: i + 1, callButton: { displayText: b.text, phoneNumber: b.phone } };
    return { index: i + 1, quickReplyButton: { displayText: b.text, id: b.id } };
  });

  const msg = {
    image: { url: filePath },
    caption,
    footer,
    templateButtons
  };

  await sock.sendMessage(jid, msg);
}

export function aestheticWrap(title, body, icons, emojis) {
  const header = `⋆˚꩜｡ ${icons} ${emojis}\n${title}`;
  const line = "彡 ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈";
  return `${header}\n${line}\n${body}\n${line}\n${icons}`;
}
