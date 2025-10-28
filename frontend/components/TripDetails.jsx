'use client';

export default function TripDetails({ trip, selectedLocation }) {
  if (!trip) {
    return (
      <div className="rounded-lg border border-dashed border-orange-200 p-6 text-center text-orange-400">
        Select a pin or trip to see details
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-orange-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-orange-600">{trip.name}</h2>
        {trip.description ? <p className="mt-2 text-gray-600">{trip.description}</p> : null}
        <p className="mt-1 text-sm text-gray-500">
          {new Date(trip.start_date).toLocaleDateString()} —{' '}
          {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'TBD'}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800">Locations</h3>
        <ul className="mt-2 space-y-3">
          {(trip.locations || []).map((location) => {
            const isActive = selectedLocation && selectedLocation.id === location.id;
            return (
              <li
                key={location.id}
                className={`rounded-md border p-3 transition ${
                  isActive ? 'border-orange-400 bg-orange-50 shadow' : 'border-orange-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {location.city}, {location.country}
                  </span>
                  {location.visited_at ? (
                    <span className="text-xs text-gray-500">
                      {new Date(location.visited_at).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
                {location.notes ? <p className="mt-2 text-sm text-gray-600">{location.notes}</p> : null}
                {location.image_url ? (
                  <img
                    src={location.image_url}
                    alt={`${location.city} ${location.country}`}
                    className="mt-3 h-32 w-full rounded-md object-cover"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
