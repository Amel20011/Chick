import { reply, cuteMenu } from "../../lib/message.js";
import config from "../../config.js";

export const command = "allmenu";

export async function run({ sock, meta }) {
  const body = [
    "Main: menu, info, ping, owner",
    "Group: antilink, add, kick, promote, demote, tagall, hidetag, setname, setdesc, mute, unmute, linkgroup, revoke, delete",
    "Owner: self, public, setppbot, restart, shutdown, backup, block, unblock",
    "Fun: poll (/poll Title | A | B)"
  ];
  await reply(sock, meta.jid, cuteMenu(`All commands 🌷`, body));
}
