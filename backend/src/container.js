import dotenv from 'dotenv';
import ObjectionTripRepository from './infrastructure/persistence/objection/TripRepository.js';
import ObjectionLocationRepository from './infrastructure/persistence/objection/LocationRepository.js';
import ObjectionUserRepository from './infrastructure/persistence/objection/UserRepository.js';
import ListTripsUseCase from './application/use-cases/ListTripsUseCase.js';
import GetTripUseCase from './application/use-cases/GetTripUseCase.js';
import CreateTripUseCase from './application/use-cases/CreateTripUseCase.js';
import AddLocationToTripUseCase from './application/use-cases/AddLocationToTripUseCase.js';
import ListLocationsUseCase from './application/use-cases/ListLocationsUseCase.js';
import RegisterUserUseCase from './application/use-cases/RegisterUserUseCase.js';
import LoginUserUseCase from './application/use-cases/LoginUserUseCase.js';
import GetUserProfileUseCase from './application/use-cases/GetUserProfileUseCase.js';
import ListUsersUseCase from './application/use-cases/admin/ListUsersUseCase.js';
import GetAdminUserUseCase from './application/use-cases/admin/GetUserUseCase.js';
import UpdateUserRoleUseCase from './application/use-cases/admin/UpdateUserRoleUseCase.js';
import ListRolesPermissionsUseCase from './application/use-cases/admin/ListRolesPermissionsUseCase.js';
import UpdateRolePermissionsUseCase from './application/use-cases/admin/UpdateRolePermissionsUseCase.js';
import PasswordHasher from './application/services/PasswordHasher.js';
import JwtService from './application/services/JwtService.js';
import AuthorizationService from './application/authorization/AuthorizationService.js';
import AuthorizationRepository from './infrastructure/persistence/objection/AuthorizationRepository.js';
import getRedisClient from './infrastructure/cache/redisClient.js';
import RedisCache, {
  defaultPrefix,
  defaultTTLSeconds,
  parseTTL,
} from './infrastructure/cache/RedisCache.js';

dotenv.config();

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
    this.userRepository = new ObjectionUserRepository();
    this.authorizationRepository = new AuthorizationRepository();

    this.passwordHasher = new PasswordHasher({
      rounds: parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10) || 10,
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    this.jwtService = new JwtService({
      secret: jwtSecret,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    });

    this.authorizationService = new AuthorizationService(
      this.authorizationRepository
    );

    this.listTripsUseCase = new ListTripsUseCase(this.tripRepository);
    this.getTripUseCase = new GetTripUseCase(this.tripRepository);
    this.createTripUseCase = new CreateTripUseCase(this.tripRepository);
    this.addLocationToTripUseCase = new AddLocationToTripUseCase(
      this.tripRepository
    );
    this.listLocationsUseCase = new ListLocationsUseCase(
      this.locationRepository
    );
    this.registerUserUseCase = new RegisterUserUseCase(
      this.userRepository,
      this.passwordHasher
    );
    this.loginUserUseCase = new LoginUserUseCase(
      this.userRepository,
      this.passwordHasher
    );
    this.getUserProfileUseCase = new GetUserProfileUseCase(
      this.userRepository
    );
    this.listUsersUseCase = new ListUsersUseCase(this.userRepository);
    this.getAdminUserUseCase = new GetAdminUserUseCase(this.userRepository);
    this.updateUserRoleUseCase = new UpdateUserRoleUseCase(
      this.userRepository,
      this.authorizationRepository
    );
    this.listRolesPermissionsUseCase = new ListRolesPermissionsUseCase(
      this.authorizationRepository
    );
    this.updateRolePermissionsUseCase = new UpdateRolePermissionsUseCase(
      this.authorizationRepository
    );
  }
}

const container = new Container();

export default container;
