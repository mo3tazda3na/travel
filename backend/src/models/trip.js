import { Model } from 'objection';
import '../db/knex.js';
import Location from './location.js';

class Trip extends Model {
  static get tableName() {
    return 'trips';
  }

  static get relationMappings() {
    return {
      locations: {
        relation: Model.HasManyRelation,
        modelClass: Location,
        join: {
          from: 'trips.id',
          to: 'locations.trip_id'
        }
      }
    };
  }

  static get modifiers() {
    return {
      orderByVisited(builder) {
        builder.orderBy('visited_at', 'asc');
      }
    };
  }
}

export const listTrips = async () => {
  return Trip.query()
    .orderBy('start_date', 'desc')
    .withGraphFetched('locations(orderByVisited)');
};

export const getTripById = async (id) => {
  return Trip.query()
    .findById(id)
    .withGraphFetched('locations(orderByVisited)');
};

export const createTrip = async (tripData) => {
  const trip = await Trip.query().insertAndFetch(tripData);
  const tripJson = trip.toJSON ? trip.toJSON() : trip;
  return { ...tripJson, locations: [] };
};

export default Trip;
