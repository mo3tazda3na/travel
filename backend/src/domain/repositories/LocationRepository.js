export default class LocationRepository {
  async listLocations() {
    throw new Error('listLocations must be implemented by subclasses');
  }
}
