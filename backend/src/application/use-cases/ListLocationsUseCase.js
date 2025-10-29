export default class ListLocationsUseCase {
  constructor(locationRepository) {
    this.locationRepository = locationRepository;
  }

  async execute({ user, constraints } = {}) {
    if (!user?.id) {
      const error = new Error('User id is required');
      error.code = 'LOCATIONS_USER_REQUIRED';
      error.status = 400;
      throw error;
    }

    const scope = constraints?.scope || 'own';

    return this.locationRepository.listLocations({
      scope,
      userId: user.id,
    });
  }
}
