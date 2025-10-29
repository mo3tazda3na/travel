export const locationToResponse = (location) => {
  if (!location) return null;

  return {
    id: location.id,
    trip_id: location.tripId,
    city: location.city,
    country: location.country,
    lat: location.latitude,
    lng: location.longitude,
    notes: location.notes,
    image_url: location.imageUrl,
    visited_at: location.visitedAt
  };
};
