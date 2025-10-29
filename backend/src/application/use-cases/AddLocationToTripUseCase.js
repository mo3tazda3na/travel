export default class AddLocationToTripUseCase {
  constructor(tripRepository) {
    this.tripRepository = tripRepository;
  }

  async execute(tripId, locationInput) {
    if (!tripId) {
      const error = new Error('Trip id is required');
      error.code = 'LOCATION_TRIP_REQUIRED';
      error.status = 400;
      throw error;
    }

    return this.tripRepository.addLocationToTrip(tripId, locationInput);
  }
}
