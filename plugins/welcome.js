import { DB } from "../lib/database.js";

// Plugin untuk welcome member baru
export default {
  onParticipant: async ({ sock, event, config }) => {
    try {
      // Hanya proses ketika ada member yang ditambahkan
      if (event.action === 'add') {
        for (const participant of event.participants) {
          const groupJid = event.jid;
          const userJid = participant;
          
          // Update group last active
          await DB.updateGroupLastActive(groupJid);
          
          // Ambil data grup
          const g = await DB.getGroup(groupJid) || {};
          
          // Cek apakah welcome aktif
          if (g.welcome !== true) return;
          
          // Dapatkan metadata grup untuk nama grup
          let groupName = "Grup";
          try {
            const metadata = await sock.groupMetadata(groupJid);
            groupName = metadata.subject;
          } catch (error) {
            console.log("Gagal mendapatkan metadata grup:", error);
          }
          
          // Kirim pesan welcome dengan button
          await sock.sendMessage(groupJid, {
            text: `🌸✨ ᴡᴇʟᴄᴏᴍᴇ @${userJid.split('@')[0]} ✨🌸\nꜱᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ ᴅɪ ʙᴏᴛ ᴋᴀᴍɪ 💗\nꜱᴇᴍᴏɢᴀ ʜᴀʀɪᴍᴜ ᴍᴇɴʏᴇɴᴀɴɢᴋᴀɴ 🌷\n\n🦋 ᴊᴀɴɢᴀɴ ʟᴜᴘᴀ\n🌸 ᴋʟɪᴋ ʟɪsᴛ ᴍᴇssᴀɢᴇ ʙᴜᴛᴛᴏɴ ᴅɪ ʙᴀᴡᴀʜ\n🌹 ᴜɴᴛᴜᴋ ᴍᴇʟɪʜᴀᴛ ᴍᴇɴᴜ ʏᴀ 💕`,
            mentions: [userJid],
            templateButtons: [
              {
                index: 1,
                quickReplyButton: {
                  displayText: "📋 List Message",
                  id: "list_menu"
                }
              }
            ]
          });
          
          // Tambahkan data user ke database jika belum ada
          const userData = await DB.getUser(userJid) || {};
          if (!userData.joinedGroups) userData.joinedGroups = [];
          if (!userData.joinedGroups.includes(groupJid)) {
            userData.joinedGroups.push(groupJid);
            userData.lastGroupJoin = new Date().toISOString();
            await DB.setUser(userJid, userData);
          }
        }
      }
    } catch (error) {
      console.error("Error in welcome plugin:", error);
    }
  }
};
