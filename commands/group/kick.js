import { removeParticipant } from "../../lib/group.js";
import { reply } from "../../lib/message.js";
import { requireGroup } from "../../lib/permission.js";

export const command = "kick";

export async function run({ sock, meta, args }) {
  requireGroup(meta);
  const num = (args[0] || "").replace(/[^\d]/g, "");
  if (!num) return reply(sock, meta.jid, "Usage: .kick 62xxxxxxxxxx");
  await removeParticipant(sock, meta.jid, `${num}@s.whatsapp.net`);
  await reply(sock, meta.jid, `Removed @${num}`);
}
