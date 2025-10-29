import bcrypt from 'bcryptjs';

const DEFAULT_ROUNDS = 10;

export default class PasswordHasher {
  constructor({ rounds = DEFAULT_ROUNDS } = {}) {
    this.rounds = rounds;
  }

  async hash(plainText) {
    return bcrypt.hash(plainText, this.rounds);
  }

  async compare(plainText, hash) {
    if (!hash) {
      return false;
    }

    return bcrypt.compare(plainText, hash);
  }
}
