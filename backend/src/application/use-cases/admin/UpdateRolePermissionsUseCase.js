export default class UpdateRolePermissionsUseCase {
  constructor(authorizationRepository) {
    this.authorizationRepository = authorizationRepository;
  }

  async execute(roleId, permissionIds) {
    if (!roleId) {
      const error = new Error('Role id is required');
      error.code = 'ADMIN_ROLE_ID_REQUIRED';
      error.status = 400;
      throw error;
    }

    if (!Array.isArray(permissionIds)) {
      const error = new Error('Permissions must be an array');
      error.code = 'ADMIN_PERMISSIONS_INVALID';
      error.status = 400;
      throw error;
    }

    await this.authorizationRepository.updateRolePermissions(roleId, permissionIds);

    const [roles, permissions] = await Promise.all([
      this.authorizationRepository.listRolesWithPermissions(),
      this.authorizationRepository.listPermissions(),
    ]);

    const updatedRole = roles.find((role) => role.id === roleId) || null;

    return {
      role: updatedRole,
      permissions,
    };
  }
}
