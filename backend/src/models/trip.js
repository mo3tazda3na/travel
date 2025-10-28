import db from '../db/knex.js';

export const listTrips = async () => {
  const trips = await db('trips').select('*').orderBy('start_date', 'desc');
  const locations = await db('locations').select('*').orderBy('visited_at', 'asc');

  const locationsByTrip = locations.reduce((acc, location) => {
    if (!acc[location.trip_id]) {
      acc[location.trip_id] = [];
    }
    acc[location.trip_id].push(location);
    return acc;
  }, {});

  return trips.map((trip) => ({
    ...trip,
    locations: locationsByTrip[trip.id] || []
  }));
};

export const getTripById = async (id) => {
  const trip = await db('trips').where({ id }).first();
  if (!trip) return null;

  const locations = await db('locations')
    .where({ trip_id: id })
    .orderBy('visited_at', 'asc');

  return { ...trip, locations };
};

export const createTrip = async (tripData) => {
  const [trip] = await db('trips')
    .insert(tripData)
    .returning('*');
  return { ...trip, locations: [] };
};
