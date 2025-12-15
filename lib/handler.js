import fs from "fs";
import path from "path";
import { shapeMeta, extractCommand, reply } from "./message.js";
import { logError } from "./utils.js";

const registries = {
  plugins: [],
  commands: new Map()
};

export async function loadAll(sock, config) {
  await loadPlugins(sock, config);
  await loadCommands(sock, config);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const m of messages) {
      try {
        const meta = shapeMeta(sock, m);

        // Run plugins (middlewares)
        for (const p of registries.plugins) {
          try { await p.run({ sock, config, meta }); } catch (e) { logError(e); }
        }

        const parsed = extractCommand(meta);
        if (!parsed) continue;
        const cmdFn = registries.commands.get(parsed.cmd);
        if (!cmdFn) continue;

        await cmdFn({ sock, config, meta, args: parsed.args });
      } catch (e) {
        logError(e);
      }
    }
  });

  // Participant updates for welcome
  sock.ev.on("group-participants.update", async (event) => {
    for (const p of registries.plugins) {
      if (p.onParticipant) {
        try { await p.onParticipant({ sock, event, config }); } catch (e) { logError(e); }
      }
    }
  });

  // Anti-delete hook
  sock.ev.on("message.deleted", async (u) => {
    for (const p of registries.plugins) {
      if (p.onDelete) {
        try { await p.onDelete({ sock, update: u }); } catch (e) { logError(e); }
      }
    }
  });
}

async function loadPlugins(sock, config) {
  const dir = "./plugins";
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
  for (const f of files) {
    const mod = await import(path.resolve(dir, f));
    registries.plugins.push(mod.default);
  }
  console.log(`Loaded plugins: ${files.length}`);
}

async function loadCommands(sock, config) {
  const dirs = ["./commands/main", "./commands/group", "./commands/owner"];
  for (const d of dirs) {
    const files = fs.readdirSync(d).filter(f => f.endsWith(".js"));
    for (const f of files) {
      const mod = await import(path.resolve(d, f));
      registries.commands.set(mod.command, mod.run);
    }
  }
  console.log(`Loaded commands: ${registries.commands.size}`);
}
