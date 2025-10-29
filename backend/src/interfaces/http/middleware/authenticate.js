import container from '../../../container.js';
import HttpError from '../errors/HttpError.js';

const extractToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token.trim();
};

const authenticate = async (req, _res, next) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      throw new HttpError({
        status: 401,
        code: 'AUTH_UNAUTHORIZED',
        message: 'Authorization token is missing or invalid',
        src: 'auth:middleware',
      });
    }

    let payload;
    try {
      payload = container.jwtService.verify(token);
    } catch (error) {
      const authError = new HttpError({
        status: 401,
        code: 'AUTH_INVALID_TOKEN',
        message: 'Authentication token is invalid or expired',
        src: 'auth:middleware:verify',
      });
      authError.debug = { original: error.message };
      throw authError;
    }

    const userId = payload?.sub ?? payload?.userId ?? payload?.id;
    if (!userId) {
      throw new HttpError({
        status: 401,
        code: 'AUTH_INVALID_TOKEN',
        message: 'Authentication token payload is invalid',
        src: 'auth:middleware:payload',
      });
    }

    const user = await container.getUserProfileUseCase.execute(userId);
    if (!user) {
      throw new HttpError({
        status: 401,
        code: 'AUTH_UNKNOWN_USER',
        message: 'User for this token no longer exists',
        src: 'auth:middleware:user',
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionLevel: user.subscriptionLevel,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
