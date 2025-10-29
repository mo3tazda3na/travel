export default class LocationRepository {
  async listLocations(_filter) {
    throw new Error('listLocations must be implemented by subclasses');
  }
}
