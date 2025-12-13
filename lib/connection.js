import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from "ye-bail";
import pino from "pino";
import fs from "fs";

export async function startConnection(config) {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    browser: ["Liviaa🌷", "Chrome", "20"],
    markOnlineOnConnect: false,
    syncFullHistory: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (u) => {
    const { connection, lastDisconnect, qr } = u;
    if (qr) console.log(`Scan QR to login for ${config.botName} ${config.aesthetic.emojis}`);
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        startConnection(config);
      } else {
        console.log("Logged out, delete session to re-login.");
      }
    } else if (connection === "open") {
      console.log(`${config.botName} connected!`);
    }
  });

  // Minimal message cache for anti-delete & view-once
  sock.msgStore = new Map();

  sock.ev.on("messages.upsert", ({ messages, type }) => {
    for (const m of messages) {
      const id = m.key.id;
      sock.msgStore.set(id, m);
    }
  });

  sock.ev.on("messages.update", (updates) => {
    for (const u of updates) {
      if (u.update?.message === null && u.key?.id) {
        // deleted message observed
        sock.ev.emit("message.deleted", u);
      }
    }
  });

  return sock;
}
