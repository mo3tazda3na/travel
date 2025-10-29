import TripRepository from '../../../domain/repositories/TripRepository.js';
import Trip from '../../../domain/entities/Trip.js';
import Location from '../../../domain/entities/Location.js';
import TripModel from './models/TripModel.js';
import LocationModel from './models/LocationModel.js';

const toPlain = (record) => (record?.toJSON ? record.toJSON() : record);

const mapLocation = (record) => {
  if (!record) return null;
  const plain = toPlain(record);
  return new Location({
    id: plain.id,
    tripId: plain.trip_id,
    city: plain.city,
    country: plain.country,
    latitude: plain.lat === null || plain.lat === undefined ? null : Number(plain.lat),
    longitude: plain.lng === null || plain.lng === undefined ? null : Number(plain.lng),
    notes: plain.notes,
    imageUrl: plain.image_url,
    visitedAt: plain.visited_at
  });
};

const mapTrip = (record) => {
  if (!record) return null;
  const plain = toPlain(record);
  const locations = Array.isArray(plain.locations)
    ? plain.locations.map(mapLocation).filter(Boolean)
    : [];

  return new Trip({
    id: plain.id,
    name: plain.name,
    description: plain.description,
    startDate: plain.start_date,
    endDate: plain.end_date,
    createdAt: plain.created_at,
    locations
  });
};

export default class ObjectionTripRepository extends TripRepository {
  async listTrips() {
    const trips = await TripModel.query()
      .orderBy('start_date', 'desc')
      .withGraphFetched('locations(orderByVisited)');

    return trips.map(mapTrip);
  }

  async getTripById(id) {
    const trip = await TripModel.query()
      .findById(id)
      .withGraphFetched('locations(orderByVisited)');

    return mapTrip(trip);
  }

  async createTrip(tripInput) {
    const created = await TripModel.query().insertAndFetch({
      name: tripInput.name,
      description: tripInput.description ?? '',
      start_date: tripInput.startDate,
      end_date: tripInput.endDate ?? null
    });

    const trip = mapTrip(created);
    trip.locations = [];
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
      visited_at: locationInput.visitedAt ?? null
    });

    return mapLocation(createdLocation);
  }

  async listLocations() {
    const locations = await LocationModel.query();
    return locations.map(mapLocation);
  }
}
