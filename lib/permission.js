import config from "../config.js";

export function isOwner(jid) {
  const pure = jid.split("@")[0];
  return pure.includes(config.ownerNumber.replace("+", ""));
}

export function requireOwner(jid) {
  if (!isOwner(jid)) {
    throw new Error("Owner-only command.");
  }
}

export function requireGroup(meta) {
  if (!meta.isGroup) throw new Error("Group-only command.");
}

export function requireAdmin(meta) {
  if (!meta.isAdmin) throw new Error("Admin-only command.");
}
