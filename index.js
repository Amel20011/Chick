import { startConnection } from "./lib/connection.js";
import config from "./config.js";
import { loadAll } from "./lib/handler.js";
import { ensureFiles } from "./lib/utils.js";
import { setupProcessHooks } from "./lib/utils.js";

await ensureFiles();
setupProcessHooks();

const sock = await startConnection(config);
await loadAll(sock, config);

console.log(`[${config.botName}] Ready ${config.aesthetic.emojis}`);
