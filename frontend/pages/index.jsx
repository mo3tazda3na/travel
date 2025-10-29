import { useEffect, useMemo, useState } from 'react';
import { extractDataOrThrow } from '../lib/api.js';
import AddTripForm from '../components/AddTripForm.jsx';
import MapView from '../components/MapView.jsx';
import TripDetails from '../components/TripDetails.jsx';
import TripList from '../components/TripList.jsx';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const API_TRIPS_BASE = `${API_BASE_URL}/api/v1/trips`;

export default function HomePage() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filters, setFilters] = useState({ year: 'all', country: 'all' });

  const fetchTrips = async () => {
    try {
      const response = await fetch(API_TRIPS_BASE);
      const data = await extractDataOrThrow(response);
      const list = Array.isArray(data) ? data : [];
      setTrips(list);
      if (!selectedTrip && list.length > 0) {
        setSelectedTrip(list[0]);
      }
    } catch (error) {
      console.error('Failed to fetch trips', error);
    }
  };

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set();
    trips.forEach((trip) => {
      if (trip.start_date) {
        years.add(new Date(trip.start_date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [trips]);

  const availableCountries = useMemo(() => {
    const countries = new Set();
    trips.forEach((trip) => {
      (trip.locations || []).forEach((location) => {
        if (location.country) {
          countries.add(location.country);
        }
      });
    });
    return Array.from(countries).sort((a, b) => a.localeCompare(b));
  }, [trips]);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const yearMatch =
        filters.year === 'all' || new Date(trip.start_date).getFullYear() === Number(filters.year);

      const countryMatch =
        filters.country === 'all' ||
        (trip.locations || []).some((location) => location.country === filters.country);

      return yearMatch && countryMatch;
    });
  }, [filters, trips]);

  useEffect(() => {
    if (selectedTrip && !filteredTrips.some((trip) => trip.id === selectedTrip.id)) {
      setSelectedTrip(filteredTrips[0] || null);
      setSelectedLocation(null);
    }
  }, [filteredTrips, selectedTrip]);

  const syncTripInState = (trip) => {
    setTrips((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === trip.id);
      if (existingIndex === -1) {
        return [trip, ...prev];
      }
      const updated = [...prev];
      updated[existingIndex] = trip;
      return updated;
    });
  };

  const handleTripCreated = (newTrip) => {
    syncTripInState(newTrip);
    setSelectedTrip(newTrip);
    setSelectedLocation(null);
  };

  const handleSelectTrip = async (trip) => {
    try {
      const response = await fetch(`${API_TRIPS_BASE}/${trip.id}`);
      const data = await extractDataOrThrow(response);
      syncTripInState(data);
      setSelectedTrip(data);
      setSelectedLocation(null);
    } catch (error) {
      console.error(`Failed to fetch trip ${trip.id}`, error);
    }
  };

  const handleLocationClick = async (location) => {
    try {
      const response = await fetch(`${API_TRIPS_BASE}/${location.tripId}`);
      const data = await extractDataOrThrow(response);
      syncTripInState(data);
      setSelectedTrip(data);
      setSelectedLocation(location);
    } catch (error) {
      console.error(`Failed to fetch trip ${location.tripId}`, error);
    }
  };

  useEffect(() => {
    if (selectedLocation && selectedTrip && selectedTrip.id !== selectedLocation.tripId) {
      setSelectedLocation(null);
    }
  }, [selectedTrip, selectedLocation]);

  const handleLocationCreated = async (newLocation) => {
    try {
      const response = await fetch(`${API_TRIPS_BASE}/${newLocation.trip_id}`);
      const data = await extractDataOrThrow(response);
      syncTripInState(data);
      setSelectedTrip(data);
      const created = data.locations?.find((location) => location.id === newLocation.id) || null;
      setSelectedLocation(created);
    } catch (error) {
      console.error(`Failed to refresh trip ${newLocation.trip_id}`, error);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row">
        <div className="flex-1 space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-orange-600">Family Travel Journal</h1>
            <p className="text-gray-600">
              Track the cities you have visited together and plan the next adventure.
            </p>
          </header>

          <MapView trips={filteredTrips} onLocationClick={handleLocationClick} />

          <TripDetails
            trip={selectedTrip}
            selectedLocation={selectedLocation}
            onLocationCreated={handleLocationCreated}
          />
        </div>

        <aside className="w-full max-w-md space-y-6 lg:sticky lg:top-10 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
          <AddTripForm onTripCreated={handleTripCreated} />
          <TripList
            trips={filteredTrips}
            onSelectTrip={handleSelectTrip}
            activeTripId={selectedTrip?.id}
            availableYears={availableYears}
            availableCountries={availableCountries}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </aside>
      </main>
    </div>
  );
}
