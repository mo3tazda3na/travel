import container from '../../../container.js';
import HttpError from '../errors/HttpError.js';

const authorize = (
  action,
  { resource, environment, attach } = {}
) =>
  async (req, res, next) => {
    try {
      if (!req.user) {
        throw new HttpError({
          status: 401,
          code: 'AUTH_REQUIRED',
          message: 'Authentication required before authorization',
          src: `authz:${action}:missingUser`,
        });
      }

      const resourceData = resource ? await resource(req, res) : undefined;
      const environmentData = environment ? await environment(req, res) : undefined;

      const decision = await container.authorizationService.authorize(
        action,
        {
          user: req.user,
          resource: resourceData,
          environment: environmentData,
        },
        { src: `authz:${action}` }
      );

      if (!req.authz) {
        req.authz = {};
      }

      req.authz[action] = {
        decision,
        resource: resourceData,
        environment: environmentData,
      };

      if (typeof attach === 'function') {
        await attach(req, {
          decision,
          resource: resourceData,
          environment: environmentData,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default authorize;
