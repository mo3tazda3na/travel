import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'db',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'travel_app',
    password: process.env.DB_PASSWORD || 'travel_pass',
    database: process.env.DB_NAME || 'travel_db'
  },
  migrations: {
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

const db = knex(config);

export default db;
