import { Model } from 'objection';
import '../db/knex.js';

class Location extends Model {
  static get tableName() {
    return 'locations';
  }
}

export const createLocation = async (locationData) => {
  const insertedLocation = await Location.query().insertAndFetch(locationData);
  return insertedLocation.toJSON ? insertedLocation.toJSON() : insertedLocation;
};

export const listLocations = () => {
  return Location.query();
};

export default Location;
