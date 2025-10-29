import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRATION = '1h';

export default class JwtService {
  constructor({ secret, expiresIn = DEFAULT_EXPIRATION } = {}) {
    if (!secret) {
      throw new Error('JWT secret is required');
    }

    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(payload, options = {}) {
    return jwt.sign(payload, this.secret, {
      expiresIn: options.expiresIn || this.expiresIn,
      ...options,
    });
  }

  verify(token) {
    return jwt.verify(token, this.secret);
  }
}
