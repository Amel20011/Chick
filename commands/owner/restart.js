import { reply } from "../../lib/message.js";
import { requireOwner } from "../../lib/permission.js";

export const command = "restart";

export async function run({ sock, meta }) {
  requireOwner(meta.sender);
  await reply(sock, meta.jid, "Restarting bot 💗");
  process.exit(0);
}
