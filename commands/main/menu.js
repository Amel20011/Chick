import { sendButtonImage } from "../../lib/utils.js";
import { cuteMenu } from "../../lib/message.js";
import config from "../../config.js";

export const command = "menu";

export async function run({ sock, meta }) {
  const items = [
    "Main: info, ping, allmenu",
    "Group: add, kick, promote, demote, tagall, hidetag, setname, setdesc, mute, unmute, linkgroup, revoke, delete",
    "Owner: self, public, setppbot, restart, shutdown, backup, block, unblock"
  ];
  const caption = cuteMenu(`Liviaa🌷 Menu ${config.aesthetic.emojis}`, items);
  const footer = `ᯓᡣ𐭩 ${config.aesthetic.icons}`;
  await sendButtonImage(
    sock,
    meta.jid,
    config.media.menu,
    caption,
    footer,
    [
      { type: "quick", text: "𓂃 All Menu", id: "allmenu" },
      { type: "quick", text: "ᥫ᭡ Info", id: "info" },
      { type: "call", text: "🌹 Call Owner", phone: config.ownerNumber }
    ]
  );
}
