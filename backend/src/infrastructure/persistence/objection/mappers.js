import Trip from '../../../domain/entities/Trip.js';
import Location from '../../../domain/entities/Location.js';

const toPlain = (record) => (record?.toJSON ? record.toJSON() : record);

export const mapLocationRecord = (record) => {
  if (!record) return null;
  const plain = toPlain(record);
  return new Location({
    id: plain.id,
    tripId: plain.trip_id,
    city: plain.city,
    country: plain.country,
    latitude:
      plain.lat === null || plain.lat === undefined ? null : Number(plain.lat),
    longitude:
      plain.lng === null || plain.lng === undefined ? null : Number(plain.lng),
    notes: plain.notes,
    imageUrl: plain.image_url,
    visitedAt: plain.visited_at,
  });
};

export const mapTripRecord = (record) => {
  if (!record) return null;
  const plain = toPlain(record);
  const locations = Array.isArray(plain.locations)
    ? plain.locations.map(mapLocationRecord).filter(Boolean)
    : [];

  return new Trip({
    id: plain.id,
    name: plain.name,
    description: plain.description,
    startDate: plain.start_date,
    endDate: plain.end_date,
    createdAt: plain.created_at,
    locations,
  });
};

export const serializeLocationEntity = (location) => ({
  id: location.id,
  tripId: location.tripId,
  city: location.city,
  country: location.country,
  latitude: location.latitude,
  longitude: location.longitude,
  notes: location.notes,
  imageUrl: location.imageUrl,
  visitedAt: location.visitedAt,
});

export const serializeTripEntity = (trip) => ({
  id: trip.id,
  name: trip.name,
  description: trip.description,
  startDate: trip.startDate,
  endDate: trip.endDate,
  createdAt: trip.createdAt,
  locations: Array.isArray(trip.locations)
    ? trip.locations.map(serializeLocationEntity)
    : [],
});

export const deserializeLocationData = (data) =>
  new Location({
    id: data.id,
    tripId: data.tripId,
    city: data.city,
    country: data.country,
    latitude: data.latitude,
    longitude: data.longitude,
    notes: data.notes,
    imageUrl: data.imageUrl,
    visitedAt: data.visitedAt,
  });

export const deserializeTripData = (data) =>
  new Trip({
    id: data.id,
    name: data.name,
    description: data.description,
    startDate: data.startDate,
    endDate: data.endDate,
    createdAt: data.createdAt,
    locations: Array.isArray(data.locations)
      ? data.locations.map(deserializeLocationData)
      : [],
  });

export const LOCATIONS_CACHE_KEY = 'locations:all';
