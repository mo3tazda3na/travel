export default class ListTripsUseCase {
  constructor(tripRepository) {
    this.tripRepository = tripRepository;
  }

  async execute({ user, constraints } = {}) {
    if (!user?.id) {
      const error = new Error('User id is required');
      error.code = 'TRIPS_USER_REQUIRED';
      error.status = 400;
      throw error;
    }

    const scope = constraints?.scope || 'own';

    return this.tripRepository.listTrips({
      scope,
      userId: user.id,
    });
  }
}
