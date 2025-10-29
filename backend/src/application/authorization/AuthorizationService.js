import AuthorizationError from './AuthorizationError.js';

const defaultDeny = (code, reason) => ({
  effect: 'deny',
  code,
  reason,
});

const isArray = (value) => Array.isArray(value);

export default class AuthorizationService {
  constructor(authorizationRepository) {
    this.authorizationRepository = authorizationRepository;
  }

  async authorize(action, context = {}, options = {}) {
    const { throwOnDeny = true, src } = options;
    const permission = await this.authorizationRepository.getPermission(action);

    if (!permission) {
      const error = new AuthorizationError({
        message: 'No permission defined for this action',
        code: 'AUTHZ_PERMISSION_MISSING',
        src: src || `authz:${action}:missing`,
      });
      throw error;
    }

    const decision = this.evaluatePermission(permission, context);

    if (decision.effect === 'deny') {
      if (!throwOnDeny) {
        return { ...decision, allowed: false };
      }

      throw new AuthorizationError({
        message: decision.reason || 'Forbidden',
        code: decision.code || 'AUTHZ_DENIED',
        data: {
          action,
          reason: decision.reason,
          constraints: decision.constraints,
        },
        src: src || `authz:${action}`,
      });
    }

    return { ...decision, allowed: true };
  }

  evaluatePermission(permission, context) {
    const { user, resource } = context;

    if (!user) {
      return defaultDeny('AUTH_REQUIRED', 'Authentication required');
    }

    const roles = isArray(permission.roles)
      ? permission.roles
      : [];

    if (roles.length && !roles.includes(user.role)) {
      return defaultDeny(
        'AUTHZ_ROLE_DENIED',
        'User role is not permitted to perform this action'
      );
    }

    const rawConstraints = permission.constraints || {};
    const constraints =
      typeof rawConstraints === 'string'
        ? JSON.parse(rawConstraints)
        : rawConstraints;

    if (
      isArray(constraints.denySubscriptions) &&
      constraints.denySubscriptions.includes(user.subscriptionLevel)
    ) {
      return defaultDeny(
        constraints.codes?.subscription || 'SUBSCRIPTION_RESTRICTED',
        constraints.messages?.subscription || 'Subscription level is not permitted'
      );
    }

    const decision = {
      effect: permission.effect || 'allow',
      constraints: {},
    };

    if (constraints.scope) {
      const scopeMap = constraints.scope;
      const scope =
        scopeMap[user.role] || scopeMap.default || scopeMap.fallback;
      if (scope) {
        decision.constraints.scope = scope;
      }
    }

    if (!resource) {
      return decision;
    }

    const requireOwnership = constraints.requireOwnership === true;
    const ownershipBypassRoles = constraints.ownershipBypassRoles || [];
    const allowPublic = constraints.allowPublic === true;
    const resourceOwnerId =
      resource.userId ?? resource.user_id ?? null;
    const isOwner = resourceOwnerId !== null && resourceOwnerId === user.id;

    if (!requireOwnership) {
      return decision;
    }

    if (
      isOwner ||
      ownershipBypassRoles.includes(user.role) ||
      (allowPublic && resource.visibility === 'public')
    ) {
      return decision;
    }

    return defaultDeny(
      constraints.codes?.ownership || 'AUTHZ_NOT_OWNER',
      constraints.messages?.ownership ||
        'Only the resource owner may perform this action'
    );
  }
}
