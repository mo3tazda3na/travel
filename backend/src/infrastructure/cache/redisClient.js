import { createClient } from 'redis';

let clientInstance;
let connectionPromise;

const isDisabled = () =>
  (process.env.REDIS_DISABLED ?? '').toLowerCase() === 'true';

const buildRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = process.env.REDIS_PORT || '6379';
  return `redis://${host}:${port}`;
};

export const getRedisClient = () => {
  if (isDisabled()) {
    return null;
  }

  if (clientInstance) {
    return clientInstance;
  }

  const clientOptions = {
    url: buildRedisUrl(),
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  };

  if (process.env.REDIS_USERNAME) {
    clientOptions.username = process.env.REDIS_USERNAME;
  }

  if (process.env.REDIS_PASSWORD) {
    clientOptions.password = process.env.REDIS_PASSWORD;
  }

  clientInstance = createClient(clientOptions);

  clientInstance.on('error', (error) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Redis client error', error);
    }
  });

  connectionPromise = clientInstance.connect().catch((error) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Failed to connect to Redis', error);
    }
  });

  return clientInstance;
};

export const getRedisConnection = () => connectionPromise;

export default getRedisClient;
