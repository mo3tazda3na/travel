export default class Location {
  constructor({
    id = null,
    tripId,
    city,
    country,
    latitude,
    longitude,
    notes = null,
    imageUrl = null,
    visitedAt = null,
  }) {
    this.id = id;
    this.tripId = tripId;
    this.city = city;
    this.country = country;
    this.latitude = latitude;
    this.longitude = longitude;
    this.notes = notes;
    this.imageUrl = imageUrl;
    this.visitedAt = visitedAt;
  }
}
