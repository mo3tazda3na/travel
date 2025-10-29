export default class GetTripUseCase {
  constructor(tripRepository) {
    this.tripRepository = tripRepository;
  }

  async execute(tripId) {
    if (!tripId) {
      const error = new Error('Trip id is required');
      error.code = 'TRIP_ID_REQUIRED';
      error.status = 400;
      throw error;
    }

    return this.tripRepository.getTripById(tripId);
  }
}
