export default class Trip {
  constructor({
    id = null,
    name,
    description = null,
    startDate,
    endDate,
    createdAt = null,
    locations = [],
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdAt = createdAt;
    this.locations = locations;
  }

  addLocation(location) {
    this.locations = [...this.locations, location];
  }
}
