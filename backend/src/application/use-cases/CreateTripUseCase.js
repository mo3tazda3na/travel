export default class CreateTripUseCase {
  constructor(tripRepository) {
    this.tripRepository = tripRepository;
  }

  async execute(tripInput) {
    if (!tripInput?.userId) {
      const error = new Error('Trip owner is required');
      error.code = 'TRIP_OWNER_REQUIRED';
      error.status = 400;
      throw error;
    }

    return this.tripRepository.createTrip(tripInput);
  }
}
