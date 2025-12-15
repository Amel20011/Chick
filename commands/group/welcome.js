import { DB } from "../../lib/database.js";
import { reply } from "../../lib/message.js";
import { requireAdmin, requireGroup } from "../../lib/permission.js";

export const command = "welcome";

export async function run({ sock, meta, args }) {
  requireGroup(meta);
  requireAdmin(meta);
  
  const setting = (args[0] || "").toLowerCase();
  
  if (!["on", "off", "test"].includes(setting)) {
    return reply(sock, meta.jid, 
      "📋 *Usage Welcome Message:*\n\n" +
      "• `.welcome on` - Aktifkan welcome message\n" +
      "• `.welcome off` - Nonaktifkan welcome message\n" +
      "• `.welcome test` - Test welcome message\n\n" +
      "Format welcome:\n" +
      "🌸✨ ᴡᴇʟᴄᴏᴍᴇ @ᴜsᴇʀ ✨🌸\n" +
      "ꜱᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ ᴅɪ ʙᴏᴛ ᴋᴀᴍɪ 💗\n" +
      "ꜱᴇᴍᴏɢᴀ ʜᴀʀɪᴍᴜ ᴍᴇɴʏᴇɴᴀɴɢᴋᴀɴ 🌷\n\n" +
      "🦋 ᴊᴀɴɢᴀɴ ʟᴜᴘᴀ\n" +
      "🌸 ᴋʟɪᴋ ʟɪsᴛ ᴍᴇssᴀɢᴇ ʙᴜᴛᴛᴏɴ ᴅɪ ʙᴀᴡᴀʜ\n" +
      "🌹 ᴜɴᴛᴜᴋ ᴍᴇʟɪʜᴀᴛ ᴍᴇɴᴜ ʏᴀ 💕"
    );
  }
  
  const g = (await DB.getGroup(meta.jid)) || {};
  
  if (setting === "on") {
    g.welcome = true;
    await DB.setGroup(meta.jid, g);
    return reply(sock, meta.jid, "✅ Welcome message diaktifkan! 🌷");
  }
  
  if (setting === "off") {
    g.welcome = false;
    await DB.setGroup(meta.jid, g);
    return reply(sock, meta.jid, "✅ Welcome message dimatikan! 🌷");
  }
  
  if (setting === "test") {
    // Test welcome message
    await sock.sendMessage(meta.jid, {
      text: `🌸✨ ᴡᴇʟᴄᴏᴍᴇ @${meta.sender.split('@')[0]} ✨🌸\nꜱᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ ᴅɪ ʙᴏᴛ ᴋᴀᴍɪ 💗\nꜱᴇᴍᴏɢᴀ ʜᴀʀɪᴍᴜ ᴍᴇɴʏᴇɴᴀɴɢᴋᴀɴ 🌷\n\n🦋 ᴊᴀɴɢᴀɴ ʟᴜᴘᴀ\n🌸 ᴋʟɪᴋ ʟɪsᴛ ᴍᴇssᴀɢᴇ ʙᴜᴛᴛᴏɴ ᴅɪ ʙᴀᴡᴀʜ\n🌹 ᴜɴᴛᴜᴋ ᴍᴇʟɪʜᴀᴛ ᴍᴇɴᴜ ʏᴀ 💕`,
      mentions: [meta.sender],
      templateButtons: [
        {
          index: 1,
          quickReplyButton: {
            displayText: "📋 List Message",
            id: "list_menu_test"
          }
        }
      ]
    });
  }
}
