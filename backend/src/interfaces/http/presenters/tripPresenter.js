import { locationToResponse } from './locationPresenter.js';

export const tripToResponse = (trip) => {
  if (!trip) return null;

  return {
    id: trip.id,
    name: trip.name,
    description: trip.description,
    start_date: trip.startDate,
    end_date: trip.endDate,
    created_at: trip.createdAt,
    locations: Array.isArray(trip.locations)
      ? trip.locations.map(locationToResponse)
      : []
  };
};
