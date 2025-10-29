const defaultPrefix = 'travel';
const defaultTTLSeconds = 300;

const parseTTL = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export default class RedisCache {
  constructor(
    client,
    { prefix = defaultPrefix, ttlSeconds = defaultTTLSeconds } = {}
  ) {
    this.client = client;
    this.prefix = prefix;
    this.ttlSeconds = ttlSeconds;
  }

  buildKey(key) {
    return `${this.prefix}:${key}`;
  }

  async get(key) {
    if (!this.client) {
      return null;
    }

    try {
      const value = await this.client.get(this.buildKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logWarning('get', error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = this.ttlSeconds) {
    if (!this.client) {
      return;
    }

    try {
      const payload = JSON.stringify(value);
      const targetKey = this.buildKey(key);
      const ttl = parseTTL(ttlSeconds, this.ttlSeconds);

      if (ttl > 0) {
        await this.client.set(targetKey, payload, { EX: ttl });
      } else {
        await this.client.set(targetKey, payload);
      }
    } catch (error) {
      this.logWarning('set', error);
    }
  }

  async del(keys) {
    if (!this.client) {
      return;
    }

    try {
      const list = Array.isArray(keys) ? keys : [keys];
      if (!list.length) return;

      const prefixed = list.map((key) => this.buildKey(key));
      await this.client.del(...prefixed);
    } catch (error) {
      this.logWarning('del', error);
    }
  }

  logWarning(operation, error) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    console.warn(`Redis ${operation} failed`, error);
  }
}

export { defaultTTLSeconds, defaultPrefix, parseTTL };
