export default class ListLocationsUseCase {
  constructor(locationRepository) {
    this.locationRepository = locationRepository;
  }

  async execute() {
    return this.locationRepository.listLocations();
  }
}
