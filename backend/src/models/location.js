import db from '../db/knex.js';

export const createLocation = async (locationData) => {
  const [location] = await db('locations')
    .insert(locationData)
    .returning('*');
  return location;
};

export const listLocations = () => {
  return db('locations').select('*');
};
