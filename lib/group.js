export async function getGroupMeta(sock, jid) {
  const meta = await sock.groupMetadata(jid);
  return {
    subject: meta.subject,
    participants: meta.participants,
    admins: meta.participants.filter(p => p.admin),
    isAdmin: (userJid) => meta.participants.some(p => p.id === userJid && p.admin),
    isGroup: true
  };
}

export async function setSubject(sock, jid, name) {
  await sock.groupUpdateSubject(jid, name);
}

export async function setDesc(sock, jid, desc) {
  await sock.groupUpdateDescription(jid, desc);
}

export async function addParticipant(sock, jid, userJid) {
  await sock.groupParticipantsUpdate(jid, [userJid], "add");
}

export async function removeParticipant(sock, jid, userJid) {
  await sock.groupParticipantsUpdate(jid, [userJid], "remove");
}

export async function promote(sock, jid, userJid) {
  await sock.groupParticipantsUpdate(jid, [userJid], "promote");
}

export async function demote(sock, jid, userJid) {
  await sock.groupParticipantsUpdate(jid, [userJid], "demote");
}

export async function setAnnounce(sock, jid, announce) {
  await sock.groupSettingUpdate(jid, announce ? "announcement" : "not_announcement");
}
