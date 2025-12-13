import { demote } from "../../lib/group.js";
import { reply } from "../../lib/message.js";
import { requireGroup } from "../../lib/permission.js";

export const command = "demote";

export async function run({ sock, meta, args }) {
  requireGroup(meta);
  const num = (args[0] || "").replace(/[^\d]/g, "");
  if (!num) return reply(sock, meta.jid, "Usage: .demote 62xxxxxxxxxx");
  await demote(sock, meta.jid, `${num}@s.whatsapp.net`);
  await reply(sock, meta.jid, `Demoted @${num}`);
}
