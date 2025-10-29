export default class CreateTripUseCase {
  constructor(tripRepository) {
    this.tripRepository = tripRepository;
  }

  async execute(tripInput) {
    return this.tripRepository.createTrip(tripInput);
  }
}
