export default class Trip {
  constructor({
    id = null,
    name,
    description = null,
    startDate,
    endDate,
    createdAt = null,
    locations = [],
    userId = null,
    visibility = 'private',
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdAt = createdAt;
    this.locations = locations;
    this.userId = userId;
    this.visibility = visibility;
  }

  addLocation(location) {
    this.locations = [...this.locations, location];
  }
}
