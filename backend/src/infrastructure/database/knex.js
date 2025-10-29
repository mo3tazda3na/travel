import knex from 'knex';
import { Model } from 'objection';
import knexfile from '../../../knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

if (!config) {
  throw new Error(
    `Knex configuration for environment "${environment}" is not defined.`
  );
}

const db = knex(config);

Model.knex(db);

export default db;
