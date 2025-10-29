import UserRepository from '../../../domain/repositories/UserRepository.js';
import User from '../../../domain/entities/User.js';
import UserModel from './models/UserModel.js';

const mapUserRecord = (record) => {
  if (!record) {
    return null;
  }

  const plain =
    typeof record.toJSON === 'function' ? record.toJSON() : { ...record };

  return new User({
    id: plain.id,
    name: plain.name,
    email: plain.email,
    passwordHash: plain.password_hash,
    createdAt: plain.created_at,
    role: plain.role ?? 'member',
    subscriptionLevel: plain.subscription_level ?? 'free',
  });
};

export default class ObjectionUserRepository extends UserRepository {
  async createUser(userInput) {
    const created = await UserModel.query().insertAndFetch({
      name: userInput.name,
      email: userInput.email,
      password_hash: userInput.passwordHash,
      role: userInput.role ?? 'member',
      subscription_level: userInput.subscriptionLevel ?? 'free',
    });

    return mapUserRecord(created);
  }

  async findByEmail(email) {
    const user = await UserModel.query().findOne({ email });
    return mapUserRecord(user);
  }

  async findById(id) {
    const user = await UserModel.query().findById(id);
    return mapUserRecord(user);
  }

  async listUsers({ filter = {}, pagination = {} } = {}) {
    const query = UserModel.query().orderBy('created_at', 'desc');

    if (filter.role) {
      query.where('role', filter.role);
    }

    if (filter.subscriptionLevel) {
      query.where('subscription_level', filter.subscriptionLevel);
    }

    const pageSize = pagination.limit && pagination.limit > 0 ? pagination.limit : undefined;
    const pageNumber = pagination.page && pagination.page > 0 ? pagination.page - 1 : undefined;

    if (pageSize) {
      const result = await query.page(pageNumber ?? 0, pageSize);
      return {
        users: result.results.map(mapUserRecord),
        total: result.total,
      };
    }

    const users = await query;
    return {
      users: users.map(mapUserRecord),
      total: users.length,
    };
  }

  async updateUser(id, updates) {
    const payload = {};

    if (updates.name !== undefined) {
      payload.name = updates.name;
    }
    if (updates.email !== undefined) {
      payload.email = updates.email;
    }
    if (updates.passwordHash !== undefined) {
      payload.password_hash = updates.passwordHash;
    }
    if (updates.role !== undefined) {
      payload.role = updates.role;
    }
    if (updates.subscriptionLevel !== undefined) {
      payload.subscription_level = updates.subscriptionLevel;
    }

    if (!Object.keys(payload).length) {
      return this.findById(id);
    }

    const updated = await UserModel.query().patchAndFetchById(id, payload);
    return mapUserRecord(updated);
  }
}
