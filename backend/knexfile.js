import dotenv from 'dotenv';

dotenv.config();

const baseConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'db',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'travel_app',
    password: process.env.DB_PASSWORD || 'travel_pass',
    database: process.env.DB_NAME || 'travel_db'
  },
  migrations: {
    directory: './src/infrastructure/database/migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

export default {
  development: baseConfig,
  production: {
    ...baseConfig,
    pool: {
      min: 2,
      max: 10
    }
  }
};
