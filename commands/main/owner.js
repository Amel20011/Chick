import { reply } from "../../lib/message.js";
import config from "../../config.js";

export const command = "owner";

export async function run({ sock, meta }) {
  await reply(sock, meta.jid, `𓂃 Contact owner: https://wa.me/${config.ownerNumber.replace("+","")} 🌹`);
}
