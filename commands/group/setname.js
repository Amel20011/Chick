import { setSubject } from "../../lib/group.js";
import { reply } from "../../lib/message.js";

export const command = "setname";

export async function run({ sock, meta, args }) {
  const name = args.join(" ").trim();
  if (!name) return reply(sock, meta.jid, "Usage: .setname New Group Name");
  await setSubject(sock, meta.jid, name);
  await reply(sock, meta.jid, `Group name updated 🌷`);
}
