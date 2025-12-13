import { reply } from "../../lib/message.js";
import { requireOwner } from "../../lib/permission.js";

export const command = "shutdown";

export async function run({ sock, meta }) {
  requireOwner(meta.sender);
  await reply(sock, meta.jid, "Shutting down 🌹");
  setTimeout(() => process.exit(0), 500);
}
