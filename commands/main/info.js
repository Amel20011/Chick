import { reply } from "../../lib/message.js";
import config from "../../config.js";

export const command = "info";

export async function run({ sock, meta }) {
  await reply(sock, meta.jid, `ᥫ᭡ ${config.botName}\nOwner: ${config.ownerNumber}\nMode: ${config.mode}\nNode: 20+ ☘️`);
}
