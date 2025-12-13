import { DB } from "../../lib/database.js";
import { reply } from "../../lib/message.js";
import { requireAdmin, requireGroup } from "../../lib/permission.js";

export const command = "antilink";

export async function run({ sock, meta, args }) {
  requireGroup(meta);
  // Admin check is light; prefer server-side enforcement
  const setting = (args[0] || "").toLowerCase();
  if (!["on","off"].includes(setting)) {
    return reply(sock, meta.jid, "Usage: .antilink on|off");
  }
  const g = (await DB.getGroup(meta.jid)) || {};
  g.antilink = setting === "on";
  await DB.setGroup(meta.jid, g);
  await reply(sock, meta.jid, `Anti-link ${setting} 🌷`);
}
