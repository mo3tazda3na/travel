export default class ListTripsUseCase {
  constructor(tripRepository) {
    this.tripRepository = tripRepository;
  }

  async execute() {
    return this.tripRepository.listTrips();
  }
}
