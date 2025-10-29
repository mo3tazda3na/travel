export default class TripRepository {
  async listTrips() {
    throw new Error('listTrips must be implemented by subclasses');
  }

  async getTripById(id) {
    throw new Error('getTripById must be implemented by subclasses');
  }

  async createTrip(trip) {
    throw new Error('createTrip must be implemented by subclasses');
  }

  async addLocationToTrip(tripId, location) {
    throw new Error('addLocationToTrip must be implemented by subclasses');
  }

  async listLocations() {
    throw new Error('listLocations must be implemented by subclasses');
  }
}
