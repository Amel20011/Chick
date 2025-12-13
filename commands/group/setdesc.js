import { setDesc } from "../../lib/group.js";
import { reply } from "../../lib/message.js";

export const command = "setdesc";

export async function run({ sock, meta, args }) {
  const desc = args.join(" ").trim();
  if (!desc) return reply(sock, meta.jid, "Usage: .setdesc New description");
  await setDesc(sock, meta.jid, desc);
  await reply(sock, meta.jid, `Group description updated ☘️`);
}
