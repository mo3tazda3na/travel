import knex from 'knex';
import knexfile from '../../knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

if (!config) {
  throw new Error(`Knex configuration for environment "${environment}" is not defined.`);
}

const db = knex(config);

export default db;
