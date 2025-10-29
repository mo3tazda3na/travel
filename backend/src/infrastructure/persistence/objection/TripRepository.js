import TripRepository from '../../../domain/repositories/TripRepository.js';
import { defaultTTLSeconds, parseTTL } from '../../cache/RedisCache.js';
import {
  mapTripRecord,
  mapLocationRecord,
  serializeTripEntity,
  deserializeTripData,
  LOCATIONS_CACHE_KEY,
} from './mappers.js';
import TripModel from './models/TripModel.js';
import LocationModel from './models/LocationModel.js';

const tripsCacheKey = ({ scope, userId }) => {
  if (scope === 'all') {
    return 'trips:all';
  }

  if (!userId) {
    return null;
  }

  return `user:${userId}:trips:${scope || 'own'}`;
};

const tripCacheKey = (id) => `trip:${id}`;

export default class ObjectionTripRepository extends TripRepository {
  constructor({ cache, ttl } = {}) {
    super();
    this.cache = cache;

    const baseTTL = parseTTL(
      ttl?.default ?? process.env.REDIS_DEFAULT_TTL,
      cache?.ttlSeconds ?? defaultTTLSeconds
    );
    this.listTripsTTL = parseTTL(
      ttl?.listTrips ?? process.env.REDIS_TRIPS_TTL,
      baseTTL
    );
    this.tripTTL = parseTTL(ttl?.trip ?? process.env.REDIS_TRIP_TTL, baseTTL);
  }

  async getFromCache(key, hydrate) {
    if (!this.cache || !key) return null;
    const cached = await this.cache.get(key);
    return cached ? hydrate(cached) : null;
  }

  async setCache(key, value, ttl) {
    if (!this.cache || !key) return;
    await this.cache.set(key, value, ttl);
  }

  async invalidateCache(keys) {
    if (!this.cache) return;
    const list = (Array.isArray(keys) ? keys : [keys]).filter(Boolean);
    if (!list.length) return;
    await this.cache.del(list);
  }

  async listTrips({ scope = 'own', userId } = {}) {
    if (scope !== 'all' && !userId) {
      return [];
    }

    const cacheKey = tripsCacheKey({ scope, userId });
    const shouldUseCache = cacheKey && (scope === 'all' || scope === 'own');

    if (shouldUseCache) {
      const cachedTrips = await this.getFromCache(cacheKey, (payload) =>
        payload.map(deserializeTripData)
      );
      if (cachedTrips) {
        return cachedTrips;
      }
    }

    const query = TripModel.query()
      .orderBy('start_date', 'desc')
      .withGraphFetched('locations');

    if (scope === 'all') {
      // no additional filters
    } else if (scope === 'own_or_public') {
      query.where((builder) => {
        builder.where('user_id', userId).orWhere('visibility', 'public');
      });
    } else {
      query.where('user_id', userId);
    }

    const trips = await query;
    const mapped = trips.map(mapTripRecord).filter(Boolean);

    if (shouldUseCache) {
      await this.setCache(
        cacheKey,
        mapped.map(serializeTripEntity),
        this.listTripsTTL
      );
    }

    return mapped;
  }

  async getTripById(id) {
    if (!id) {
      return null;
    }

    const cacheKey = tripCacheKey(id);
    const cachedTrip = await this.getFromCache(cacheKey, deserializeTripData);
    if (cachedTrip) {
      return cachedTrip;
    }

    const trip = await TripModel.query()
      .findById(id)
      .withGraphFetched('locations');

    const mapped = mapTripRecord(trip);
    if (mapped) {
      await this.setCache(cacheKey, serializeTripEntity(mapped), this.tripTTL);
    }
    return mapped;
  }

  async createTrip(tripInput) {
    if (!tripInput?.userId) {
      const error = new Error('Trip userId is required');
      error.code = 'TRIP_USER_REQUIRED';
      error.status = 400;
      throw error;
    }

    const created = await TripModel.query().insertAndFetch({
      name: tripInput.name,
      description: tripInput.description ?? '',
      start_date: tripInput.startDate,
      end_date: tripInput.endDate ?? null,
      user_id: tripInput.userId,
      visibility: tripInput.visibility ?? 'private',
    });

    const trip = mapTripRecord(created);
    trip.locations = [];

    if (trip?.id) {
      await this.invalidateCache([
        'trips:all',
        tripsCacheKey({ scope: 'own', userId: trip.userId }),
      ]);
      await this.setCache(
        tripCacheKey(trip.id),
        serializeTripEntity(trip),
        this.tripTTL
      );
    }

    return trip;
  }

  async addLocationToTrip(tripId, locationInput) {
    if (!tripId) {
      return null;
    }

    const trip = await TripModel.query().findById(tripId);

    if (!trip) {
      return null;
    }

    const createdLocation = await LocationModel.query().insertAndFetch({
      trip_id: tripId,
      city: locationInput.city,
      country: locationInput.country,
      lat: locationInput.latitude,
      lng: locationInput.longitude,
      notes: locationInput.notes ?? '',
      image_url: locationInput.imageUrl ?? null,
      visited_at: locationInput.visitedAt ?? null,
    });

    const location = mapLocationRecord(createdLocation);
    await this.invalidateCache([
      'trips:all',
      tripsCacheKey({ scope: 'own', userId: trip.user_id }),
      tripCacheKey(tripId),
      LOCATIONS_CACHE_KEY({ scope: 'all' }),
      LOCATIONS_CACHE_KEY({ scope: 'own', userId: trip.user_id }),
    ]);
    return location;
  }
}
