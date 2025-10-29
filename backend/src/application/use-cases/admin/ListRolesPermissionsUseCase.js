export default class ListRolesPermissionsUseCase {
  constructor(authorizationRepository) {
    this.authorizationRepository = authorizationRepository;
  }

  async execute() {
    const [roles, permissions] = await Promise.all([
      this.authorizationRepository.listRolesWithPermissions(),
      this.authorizationRepository.listPermissions(),
    ]);

    return { roles, permissions };
  }
}
