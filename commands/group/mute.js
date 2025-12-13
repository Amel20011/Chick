import { setAnnounce } from "../../lib/group.js";
import { reply } from "../../lib/message.js";

export const command = "mute";

export async function run({ sock, meta }) {
  await setAnnounce(sock, meta.jid, true);
  await reply(sock, meta.jid, "Group closed 🌹 (Admins only can chat)");
}
