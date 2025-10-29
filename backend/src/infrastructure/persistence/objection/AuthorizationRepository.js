import db from '../../database/knex.js';

const DEFAULT_CACHE_TTL_MS = 60 * 1000;

export default class AuthorizationRepository {
  constructor({ cacheTtlMs = DEFAULT_CACHE_TTL_MS } = {}) {
    this.cacheTtlMs = cacheTtlMs;
    this.cache = null;
    this.cacheLoadedAt = 0;
  }

  async loadPermissions() {
    const now = Date.now();
    if (this.cache && now - this.cacheLoadedAt < this.cacheTtlMs) {
      return this.cache;
    }

    const rows = await db('permissions')
      .select(
        'permissions.id',
        'permissions.action',
        'permissions.effect',
        'permissions.scope',
        'permissions.constraints',
        db.raw(
          `COALESCE(json_agg(distinct roles.name) FILTER (WHERE roles.name IS NOT NULL), '[]') as roles`
        )
      )
      .leftJoin(
        'role_permissions',
        'permissions.id',
        'role_permissions.permission_id'
      )
      .leftJoin('roles', 'role_permissions.role_id', 'roles.id')
      .groupBy('permissions.id')
      .orderBy('permissions.action', 'asc');

    const permissions = new Map();
    rows.forEach((row) => {
      permissions.set(row.action, {
        id: row.id,
        action: row.action,
        effect: row.effect || 'allow',
        scope: row.scope || 'api',
        constraints: row.constraints || null,
        roles: Array.isArray(row.roles) ? row.roles : JSON.parse(row.roles || '[]'),
      });
    });

    this.cache = permissions;
    this.cacheLoadedAt = now;
    return permissions;
  }

  async getPermission(action) {
    const permissions = await this.loadPermissions();
    return permissions.get(action);
  }

  async listRolesWithPermissions() {
    const rows = await db('roles')
      .select(
        'roles.id',
        'roles.name',
        'roles.description',
        db.raw(
          `COALESCE(json_agg(distinct jsonb_strip_nulls(jsonb_build_object(
            'id', permissions.id,
            'action', permissions.action,
            'description', permissions.description,
            'scope', permissions.scope
          ))) FILTER (WHERE permissions.id IS NOT NULL), '[]') as permissions`
        )
      )
      .leftJoin(
        'role_permissions',
        'roles.id',
        'role_permissions.role_id'
      )
      .leftJoin(
        'permissions',
        'role_permissions.permission_id',
        'permissions.id'
      )
      .groupBy('roles.id')
      .orderBy('roles.name', 'asc');

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      permissions: Array.isArray(row.permissions)
        ? row.permissions
        : JSON.parse(row.permissions || '[]'),
    }));
  }

  async listPermissions() {
    const rows = await db('permissions')
      .select('id', 'action', 'description', 'scope')
      .orderBy('action', 'asc');
    return rows;
  }

  async updateRolePermissions(roleId, permissionIds = []) {
    await db.transaction(async (trx) => {
      await trx('role_permissions').where({ role_id: roleId }).del();

      if (!permissionIds.length) {
        return;
      }

      const rows = permissionIds.map((permissionId) => ({
        role_id: roleId,
        permission_id: permissionId,
      }));

      await trx('role_permissions').insert(rows);
    });

    this.invalidateCache();
  }

  invalidateCache() {
    this.cache = null;
    this.cacheLoadedAt = 0;
  }
}
