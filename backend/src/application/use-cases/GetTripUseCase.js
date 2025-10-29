export default class GetTripUseCase {
  constructor(tripRepository) {
    this.tripRepository = tripRepository;
  }

  async execute(id) {
    return this.tripRepository.getTripById(id);
  }
}
