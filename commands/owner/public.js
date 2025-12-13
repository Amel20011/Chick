import config from "../../config.js";
import { reply } from "../../lib/message.js";
import { requireOwner } from "../../lib/permission.js";

export const command = "public";

export async function run({ sock, meta }) {
  requireOwner(meta.sender);
  config.mode = "public";
  await reply(sock, meta.jid, "Mode set to public ☘️");
}
