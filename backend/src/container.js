import ObjectionTripRepository from './infrastructure/persistence/objection/TripRepository.js';
import ListTripsUseCase from './application/use-cases/ListTripsUseCase.js';
import GetTripUseCase from './application/use-cases/GetTripUseCase.js';
import CreateTripUseCase from './application/use-cases/CreateTripUseCase.js';
import AddLocationToTripUseCase from './application/use-cases/AddLocationToTripUseCase.js';
import ListLocationsUseCase from './application/use-cases/ListLocationsUseCase.js';

class Container {
  constructor() {
    this.tripRepository = new ObjectionTripRepository();

    this.listTripsUseCase = new ListTripsUseCase(this.tripRepository);
    this.getTripUseCase = new GetTripUseCase(this.tripRepository);
    this.createTripUseCase = new CreateTripUseCase(this.tripRepository);
    this.addLocationToTripUseCase = new AddLocationToTripUseCase(this.tripRepository);
    this.listLocationsUseCase = new ListLocationsUseCase(this.tripRepository);
  }
}

const container = new Container();

export default container;
