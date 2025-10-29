import ObjectionTripRepository from './infrastructure/persistence/objection/TripRepository.js';
import ObjectionLocationRepository from './infrastructure/persistence/objection/LocationRepository.js';
import ListTripsUseCase from './application/use-cases/ListTripsUseCase.js';
import GetTripUseCase from './application/use-cases/GetTripUseCase.js';
import CreateTripUseCase from './application/use-cases/CreateTripUseCase.js';
import AddLocationToTripUseCase from './application/use-cases/AddLocationToTripUseCase.js';
import ListLocationsUseCase from './application/use-cases/ListLocationsUseCase.js';
import getRedisClient from './infrastructure/cache/redisClient.js';
import RedisCache, {
  defaultPrefix,
  defaultTTLSeconds,
  parseTTL,
} from './infrastructure/cache/RedisCache.js';

class Container {
  constructor() {
    const redisClient = getRedisClient();
    const cachePrefix = process.env.REDIS_KEY_PREFIX || defaultPrefix;
    const cacheTTL = parseTTL(process.env.REDIS_DEFAULT_TTL, defaultTTLSeconds);
    const redisCache = redisClient
      ? new RedisCache(redisClient, {
        prefix: cachePrefix,
        ttlSeconds: cacheTTL,
      })
      : null;

    this.redisCache = redisCache;

    this.tripRepository = new ObjectionTripRepository({
      cache: this.redisCache,
    });
    this.locationRepository = new ObjectionLocationRepository({
      cache: this.redisCache,
    });

    this.listTripsUseCase = new ListTripsUseCase(this.tripRepository);
    this.getTripUseCase = new GetTripUseCase(this.tripRepository);
    this.createTripUseCase = new CreateTripUseCase(this.tripRepository);
    this.addLocationToTripUseCase = new AddLocationToTripUseCase(
      this.tripRepository
    );
    this.listLocationsUseCase = new ListLocationsUseCase(
      this.locationRepository
    );
  }
}

const container = new Container();

export default container;
