export default class TripRepository {
  async listTrips(_filter) {
    throw new Error('listTrips must be implemented by subclasses');
  }

  async getTripById(_id) {
    throw new Error('getTripById must be implemented by subclasses');
  }

  async createTrip(_trip) {
    throw new Error('createTrip must be implemented by subclasses');
  }

  async addLocationToTrip(_tripId, _location) {
    throw new Error('addLocationToTrip must be implemented by subclasses');
  }
}
