import fse from "fs-extra";

const dbPaths = {
  users: "./database/users.json",
  groups: "./database/groups.json",
  premium: "./database/premium.json"
};

async function read(path) {
  const raw = await fse.readFile(path, "utf8");
  return JSON.parse(raw || "{}");
}
async function write(path, data) {
  await fse.writeFile(path, JSON.stringify(data, null, 2));
}

export const DB = {
  async getUser(id) {
    const d = await read(dbPaths.users);
    return d[id] || null;
  },
  async setUser(id, obj) {
    const d = await read(dbPaths.users);
    d[id] = { ...(d[id] || {}), ...obj };
    await write(dbPaths.users, d);
  },
  async getGroup(id) {
    const d = await read(dbPaths.groups);
    return d[id] || null;
  },
  async setGroup(id, obj) {
    const d = await read(dbPaths.groups);
    d[id] = { ...(d[id] || {}), ...obj };
    await write(dbPaths.groups, d);
  },
  async getPremium(id) {
    const d = await read(dbPaths.premium);
    return !!d[id];
  },
  async setPremium(id, val) {
    const d = await read(dbPaths.premium);
    d[id] = !!val;
    await write(dbPaths.premium, d);
  }
};
