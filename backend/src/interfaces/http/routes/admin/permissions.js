import { Router } from 'express';
import container from '../../../../container.js';
import authenticate from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import RequestRule from '../../validation/RequestRule.js';
import validateRequest from '../../validation/index.js';
import { number, stringArray } from '../../validation/validators.js';
import HttpError from '../../errors/HttpError.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

const updateRolePermissionsRules = () => ({
  params: {
    id: new RequestRule(number({ integer: true, min: 1 }), { required: true }),
  },
  body: {
    permissions: new RequestRule(stringArray(), {
      required: true,
      defaultValue: [],
    }),
  },
});

router.use(authenticate);

router.get(
  '/',
  authorize('admin:permission:list'),
  async (_req, res, next) => {
    try {
      const result = await container.listRolesPermissionsUseCase.execute();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/roles/:id',
  authorize('admin:permission:update', {
    resource: async (req) => {
      const validation = validateRequest(req, updateRolePermissionsRules());
      req.validated = { ...(req.validated || {}), ...validation };

      const { roles } = await container.listRolesPermissionsUseCase.execute();
      const role = roles.find((entry) => entry.id === validation.params.id);
      if (!role) {
        throw new HttpError({
          status: 404,
          code: 'ADMIN_ROLE_NOT_FOUND',
          message: 'Role not found',
          src: 'admin:permissions:update',
        });
      }
      return role;
    },
  }),
  async (req, res, next) => {
    try {
      const { params, body } =
        req.validated || validateRequest(req, updateRolePermissionsRules());
      const allPermissions = await container.authorizationRepository.listPermissions();
      const actionToId = new Map(allPermissions.map((permission) => [permission.action, permission.id]));

      const invalidActions = body.permissions.filter((action) => !actionToId.has(action));
      if (invalidActions.length) {
        throw new HttpError({
          status: 400,
          code: 'ADMIN_PERMISSION_INVALID',
          message: `Unknown permissions: ${invalidActions.join(', ')}`,
          src: 'admin:permissions:update',
        });
      }

      const permissionIds = body.permissions.map((action) => actionToId.get(action));
      const result = await container.updateRolePermissionsUseCase.execute(
        params.id,
        permissionIds
      );

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
