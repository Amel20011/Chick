import config from "../config.js";

const buckets = new Map();

export default {
  name: "antispam",
  async run({ meta }) {
    const now = Date.now();
    const b = buckets.get(meta.sender) || { last: 0, count: 0 };
    if (now - b.last < config.antispam.cooldownMs) {
      b.count++;
    } else {
      b.count = 1;
    }
    b.last = now;
    buckets.set(meta.sender, b);
    if (b.count > config.antispam.maxBurst) {
      throw new Error("Spam detected");
    }
  }
};
