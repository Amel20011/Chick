import { sendButtonImage } from "../lib/utils.js";
import config from "../config.js";

export default {
  name: "welcome",
  async onParticipant({ sock, event }) {
    const { id: jid, action, participants } = event;
    if (action !== "add") return;
    for (const p of participants) {
      const caption = `ᥫ᭡ ${config.botName} says hello!\nWelcome ${p.split("@")[0]} 🌷\nBe kind, no spam, no links ☘️`;
      const footer = `⋆˚꩜｡ ${config.aesthetic.icons}`;
      await sendButtonImage(
        sock,
        jid,
        config.media.welcome,
        caption,
        footer,
        [
          { type: "quick", text: "ᯓᡣ𐭩 Read Rules", id: "rules" },
          { type: "quick", text: "𓂃 Menu", id: "menu" },
          { type: "url", text: "💗 Owner", url: `https://wa.me/${config.ownerNumber.replace("+","")}` }
        ]
      );
    }
  },
  async run() {}
};
