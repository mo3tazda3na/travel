import LocationRepository from '../../../domain/repositories/LocationRepository.js';
import { defaultTTLSeconds, parseTTL } from '../../cache/RedisCache.js';
import {
  mapLocationRecord,
  serializeLocationEntity,
  deserializeLocationData,
  LOCATIONS_CACHE_KEY,
} from './mappers.js';
import LocationModel from './models/LocationModel.js';

export default class ObjectionLocationRepository extends LocationRepository {
  constructor({ cache, ttl } = {}) {
    super();
    this.cache = cache;
    const baseTTL = parseTTL(
      ttl?.default ?? process.env.REDIS_DEFAULT_TTL,
      cache?.ttlSeconds ?? defaultTTLSeconds
    );
    this.locationsTTL = parseTTL(
      ttl?.locations ?? process.env.REDIS_LOCATIONS_TTL,
      baseTTL
    );
  }

  async getFromCache() {
    if (!this.cache) return null;
    const cached = await this.cache.get(LOCATIONS_CACHE_KEY);
    return cached ? cached.map(deserializeLocationData) : null;
  }

  async setCache(value) {
    if (!this.cache) return;
    const filtered = value.filter(Boolean);
    await this.cache.set(
      LOCATIONS_CACHE_KEY,
      filtered.map(serializeLocationEntity),
      this.locationsTTL
    );
  }

  async listLocations() {
    const cached = await this.getFromCache();
    if (cached) {
      return cached;
    }

    const records = await LocationModel.query();
    const locations = records.map(mapLocationRecord).filter(Boolean);
    await this.setCache(locations);
    return locations;
  }
}
