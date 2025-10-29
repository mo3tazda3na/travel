import HttpError from '../../interfaces/http/errors/HttpError.js';

export default class AuthorizationError extends HttpError {
  constructor({ message = 'Forbidden', code = 'AUTHZ_FORBIDDEN', data, src }) {
    super({
      message,
      status: 403,
      code,
      data,
      src,
    });
    this.name = 'AuthorizationError';
  }
}
