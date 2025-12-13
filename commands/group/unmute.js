import { setAnnounce } from "../../lib/group.js";
import { reply } from "../../lib/message.js";

export const command = "unmute";

export async function run({ sock, meta }) {
  await setAnnounce(sock, meta.jid, false);
  await reply(sock, meta.jid, "Group opened 💗");
}
