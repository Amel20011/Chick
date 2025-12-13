import { reply } from "../../lib/message.js";
import fse from "fs-extra";

export const command = "backup";

export async function run({ sock, meta }) {
  const zipName = `backup-${Date.now()}.zip`;
  // Simple tar-like: send database files
  await sock.sendMessage(meta.jid, { document: { url: "./database/users.json" }, mimetype: "application/json", fileName: "users.json" });
  await sock.sendMessage(meta.jid, { document: { url: "./database/groups.json" }, mimetype: "application/json", fileName: "groups.json" });
  await sock.sendMessage(meta.jid, { document: { url: "./database/premium.json" }, mimetype: "application/json", fileName: "premium.json" });
  await reply(sock, meta.jid, "Backup sent ☘️");
}
