export default class ListLocationsUseCase {
  constructor(tripRepository) {
    this.tripRepository = tripRepository;
  }

  async execute() {
    return this.tripRepository.listLocations();
  }
}
