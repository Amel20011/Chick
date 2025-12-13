import { reply } from "../../lib/message.js";

export const command = "revoke";

export async function run({ sock, meta }) {
  await sock.groupRevokeInvite(meta.jid);
  await reply(sock, meta.jid, "Invite link revoked 🌷");
}
