export default class AddLocationToTripUseCase {
  constructor(tripRepository) {
    this.tripRepository = tripRepository;
  }

  async execute(tripId, locationInput) {
    return this.tripRepository.addLocationToTrip(tripId, locationInput);
  }
}
