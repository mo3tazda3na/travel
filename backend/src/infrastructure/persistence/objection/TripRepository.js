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

const TRIPS_CACHE_KEY = 'trips:all';
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
    if (!this.cache) return null;
    const cached = await this.cache.get(key);
    return cached ? hydrate(cached) : null;
  }

  async setCache(key, value, ttl) {
    if (!this.cache) return;
    await this.cache.set(key, value, ttl);
  }

  async invalidateCache(keys) {
    if (!this.cache) return;
    await this.cache.del(keys);
  }

  async listTrips() {
    const cachedTrips = await this.getFromCache(TRIPS_CACHE_KEY, (payload) =>
      payload.map(deserializeTripData)
    );
    if (cachedTrips) {
      return cachedTrips;
    }

    const trips = await TripModel.query()
      .orderBy('start_date', 'desc')
      .withGraphFetched('locations');

    const mapped = trips.map(mapTripRecord).filter(Boolean);
    await this.setCache(
      TRIPS_CACHE_KEY,
      mapped.map(serializeTripEntity),
      this.listTripsTTL
    );
    return mapped;
  }

  async getTripById(id) {
    const cachedTrip = await this.getFromCache(
      tripCacheKey(id),
      deserializeTripData
    );
    if (cachedTrip) {
      return cachedTrip;
    }

    const trip = await TripModel.query()
      .findById(id)
      .withGraphFetched('locations');

    const mapped = mapTripRecord(trip);
    if (mapped) {
      await this.setCache(
        tripCacheKey(mapped.id),
        serializeTripEntity(mapped),
        this.tripTTL
      );
    }
    return mapped;
  }

  async createTrip(tripInput) {
    const created = await TripModel.query().insertAndFetch({
      name: tripInput.name,
      description: tripInput.description ?? '',
      start_date: tripInput.startDate,
      end_date: tripInput.endDate ?? null,
    });

    const trip = mapTripRecord(created);
    trip.locations = [];

    if (trip?.id) {
      await this.invalidateCache([TRIPS_CACHE_KEY]);
      await this.setCache(
        tripCacheKey(trip.id),
        serializeTripEntity(trip),
        this.tripTTL
      );
    }

    return trip;
  }

  async addLocationToTrip(tripId, locationInput) {
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
      TRIPS_CACHE_KEY,
      tripCacheKey(tripId),
      LOCATIONS_CACHE_KEY,
    ]);
    return location;
  }
}
