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

  async getFromCache(filter) {
    if (!this.cache) return null;
    const cacheKey = LOCATIONS_CACHE_KEY(filter);
    if (!cacheKey) return null;
    const cached = await this.cache.get(cacheKey);
    return cached ? cached.map(deserializeLocationData) : null;
  }

  async setCache(filter, value) {
    if (!this.cache) return;
    const cacheKey = LOCATIONS_CACHE_KEY(filter);
    if (!cacheKey) return;
    const filtered = value.filter(Boolean);
    await this.cache.set(
      cacheKey,
      filtered.map(serializeLocationEntity),
      this.locationsTTL
    );
  }

  async listLocations({ scope = 'own', userId } = {}) {
    if (scope !== 'all' && !userId) {
      return [];
    }

    const filter = { scope, userId };
    const shouldUseCache =
      (scope === 'all' || scope === 'own') && Boolean(LOCATIONS_CACHE_KEY(filter));

    if (shouldUseCache) {
      const cached = await this.getFromCache(filter);
      if (cached) {
        return cached;
      }
    }

    const query = LocationModel.query()
      .select('locations.*')
      .join('trips', 'locations.trip_id', 'trips.id');

    if (scope === 'all') {
      // no additional filters
    } else if (scope === 'own_or_public') {
      query.where((builder) => {
        builder.where('trips.user_id', userId).orWhere('trips.visibility', 'public');
      });
    } else {
      query.where('trips.user_id', userId);
    }

    const records = await query;
    const locations = records.map(mapLocationRecord).filter(Boolean);

    if (shouldUseCache) {
      await this.setCache(filter, locations);
    }

    return locations;
  }
}
