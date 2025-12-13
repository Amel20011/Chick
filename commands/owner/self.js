import config from "../../config.js";
import { reply } from "../../lib/message.js";
import { requireOwner } from "../../lib/permission.js";

export const command = "self";

export async function run({ sock, meta }) {
  requireOwner(meta.sender);
  config.mode = "self";
  await reply(sock, meta.jid, "Mode set to self 🌷");
}
