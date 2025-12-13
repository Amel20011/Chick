import { reply } from "../../lib/message.js";

export const command = "ping";

export async function run({ sock, meta }) {
  const t = Date.now();
  const sent = await reply(sock, meta.jid, "🌷 Pong...");
  const dt = Date.now() - t;
  await reply(sock, meta.jid, `💗 ${dt} ms`);
}
