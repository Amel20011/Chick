import fse from "fs-extra";

const dbPaths = {
  users: "./database/users.json",
  groups: "./database/groups.json",
  premium: "./database/premium.json"
};

// Pastikan file database ada
async function ensureDB() {
  for (const path of Object.values(dbPaths)) {
    if (!await fse.pathExists(path)) {
      await fse.writeFile(path, "{}");
    }
  }
}

async function read(path) {
  await ensureDB();
  const raw = await fse.readFile(path, "utf8");
  return JSON.parse(raw || "{}");
}

async function write(path, data) {
  await fse.writeFile(path, JSON.stringify(data, null, 2));
}

export const DB = {
  // User functions (existing)
  async getUser(id) {
    const d = await read(dbPaths.users);
    return d[id] || null;
  },
  async setUser(id, obj) {
    const d = await read(dbPaths.users);
    d[id] = { ...(d[id] || {}), ...obj };
    await write(dbPaths.users, d);
  },
  
  // Group functions (existing)
  async getGroup(id) {
    const d = await read(dbPaths.groups);
    return d[id] || null;
  },
  async setGroup(id, obj) {
    const d = await read(dbPaths.groups);
    d[id] = { ...(d[id] || {}), ...obj };
    await write(dbPaths.groups, d);
  },
  
  // Premium functions (existing)
  async getPremium(id) {
    const d = await read(dbPaths.premium);
    return !!d[id];
  },
  async setPremium(id, val) {
    const d = await read(dbPaths.premium);
    d[id] = !!val;
    await write(dbPaths.premium, d);
  },
  
  // --- NEW FUNCTIONS FOR REGISTER & WELCOME ---
  
  // Get all users (for admin)
  async getAllUsers() {
    const d = await read(dbPaths.users);
    return d;
  },
  
  // Get all groups (for admin)
  async getAllGroups() {
    const d = await read(dbPaths.groups);
    return d;
  },
  
  // Reset user warning (for antipromosi/antilinkall)
  async resetUserWarnings(userId, type = 'all') {
    const d = await read(dbPaths.users);
    if (d[userId]) {
      if (type === 'all' || type === 'promosi') {
        delete d[userId].warnings_promosi;
      }
      if (type === 'all' || type === 'link') {
        delete d[userId].warnings_link;
      }
      await write(dbPaths.users, d);
    }
  },
  
  // Get registered users count
  async getRegisteredCount() {
    const d = await read(dbPaths.users);
    return Object.values(d).filter(user => user.registered).length;
  },
  
  // Get groups with welcome enabled
  async getGroupsWithWelcome() {
    const d = await read(dbPaths.groups);
    return Object.entries(d)
      .filter(([_, group]) => group.welcome === true)
      .map(([id, group]) => ({ id, ...group }));
  },
  
  // Delete user data
  async deleteUser(id) {
    const d = await read(dbPaths.users);
    if (d[id]) {
      delete d[id];
      await write(dbPaths.users, d);
      return true;
    }
    return false;
  },
  
  // Delete group data
  async deleteGroup(id) {
    const d = await read(dbPaths.groups);
    if (d[id]) {
      delete d[id];
      await write(dbPaths.groups, d);
      return true;
    }
    return false;
  },
  
  // Update user last seen
  async updateUserLastSeen(id) {
    const d = await read(dbPaths.users);
    if (!d[id]) d[id] = {};
    d[id].lastSeen = new Date().toISOString();
    await write(dbPaths.users, d);
  },
  
  // Update group last active
  async updateGroupLastActive(id) {
    const d = await read(dbPaths.groups);
    if (!d[id]) d[id] = {};
    d[id].lastActive = new Date().toISOString();
    await write(dbPaths.groups, d);
  }
};
