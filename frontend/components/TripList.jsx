'use client';

export default function TripList({
  trips = [],
  onSelectTrip,
  activeTripId,
  availableYears = [],
  availableCountries = [],
  filters,
  onFiltersChange
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-orange-600">Trips</h2>
        <p className="text-sm text-gray-500">Filter by travel year or destination country.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-600">
          Year
          <select
            value={filters.year}
            onChange={(event) => onFiltersChange?.({ ...filters, year: event.target.value })}
            className="mt-1 w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
          >
            <option value="all">All</option>
            {availableYears.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-600">
          Country
          <select
            value={filters.country}
            onChange={(event) => onFiltersChange?.({ ...filters, country: event.target.value })}
            className="mt-1 w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
          >
            <option value="all">All</option>
            {availableCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="space-y-2">
        {trips.map((trip) => (
          <li key={trip.id}>
            <button
              onClick={() => onSelectTrip?.(trip)}
              className={`w-full rounded-lg border px-4 py-3 text-left transition hover:border-orange-400 hover:shadow ${
                activeTripId === trip.id ? 'border-orange-500 bg-orange-50' : 'border-orange-100 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{trip.name}</span>
                <span className="text-sm text-gray-500">
                  {new Date(trip.start_date).getFullYear()}
                </span>
              </div>
              {trip.description ? <p className="mt-1 text-sm text-gray-600">{trip.description}</p> : null}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-orange-500">
                {(trip.locations || []).map((location) => (
                  <span key={location.id} className="rounded-full bg-orange-100 px-2 py-1">
                    {location.country}
                  </span>
                ))}
              </div>
            </button>
          </li>
        ))}
        {trips.length === 0 ? (
          <li className="rounded-lg border border-dashed border-orange-200 p-4 text-center text-sm text-orange-400">
            No trips match these filters yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
