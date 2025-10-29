import { Router } from 'express';
import container from '../../../../container.js';
import authenticate from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import RequestRule from '../../validation/RequestRule.js';
import validateRequest from '../../validation/index.js';
import {
  number,
  string,
  enumeration,
} from '../../validation/validators.js';
import { sendSuccess } from '../../utils/response.js';
import HttpError from '../../errors/HttpError.js';

const router = Router();

const listUsersRules = () => ({
  query: {
    role: new RequestRule(string({ minLength: 1 }), {
      required: false,
    }),
    subscription_level: new RequestRule(string({ minLength: 1 }), {
      required: false,
      transform: (value) => value.toLowerCase(),
    }),
    limit: new RequestRule(number({ integer: true, min: 1, max: 100 }), {
      required: false,
      defaultValue: 20,
    }),
    page: new RequestRule(number({ integer: true, min: 1 }), {
      required: false,
      defaultValue: 1,
    }),
  },
});

const updateUserRules = () => ({
  params: {
    id: new RequestRule(number({ integer: true, min: 1 }), { required: true }),
  },
  body: {
    role: new RequestRule(string({ minLength: 1 }), { required: false }),
    subscription_level: new RequestRule(
      enumeration(['free', 'premium', 'suspended']),
      {
        required: false,
        transform: (value) => value.toLowerCase(),
      }
    ),
  },
});

router.use(authenticate);

router.get(
  '/',
  authorize('admin:user:list'),
  async (req, res, next) => {
    try {
      const { query } = validateRequest(req, listUsersRules());
      const result = await container.listUsersUseCase.execute({
        filter: {
          role: query.role,
          subscriptionLevel: query.subscription_level,
        },
        pagination: {
          limit: query.limit,
          page: query.page,
        },
      });

      sendSuccess(res, result.users, {
        status: 200,
        meta: {
          total: result.total,
          page: query.page,
          limit: query.limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  authorize('admin:user:view', {
    resource: async (req) => {
      const { params } = validateRequest(req, updateUserRules());
      const user = await container.getAdminUserUseCase.execute(params.id);
      if (!user) {
        throw new HttpError({
          status: 404,
          code: 'ADMIN_USER_NOT_FOUND',
          message: 'User not found',
          src: 'admin:users:view',
        });
      }
      return user;
    },
    attach: (req, { resource }) => {
      req.adminUser = resource;
    },
  }),
  async (req, res, next) => {
    try {
      const user = req.adminUser;
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  authorize('admin:user:update', {
    resource: async (req) => {
      const { params } = validateRequest(req, updateUserRules());
      const user = await container.getAdminUserUseCase.execute(params.id);
      if (!user) {
        throw new HttpError({
          status: 404,
          code: 'ADMIN_USER_NOT_FOUND',
          message: 'User not found',
          src: 'admin:users:update',
        });
      }
      return user;
    },
    attach: (req, { resource }) => {
      req.adminUser = resource;
    },
  }),
  async (req, res, next) => {
    try {
      const { params, body } = validateRequest(req, updateUserRules());
      const updated = await container.updateUserRoleUseCase.execute(
        params.id,
        {
          role: body.role,
          subscriptionLevel: body.subscription_level,
        }
      );

      if (!updated) {
        throw new HttpError({
          status: 404,
          code: 'ADMIN_USER_NOT_FOUND',
          message: 'User not found',
          src: 'admin:users:update',
        });
      }

      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
