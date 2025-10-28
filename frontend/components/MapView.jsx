'use client';

import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

const DEFAULT_CENTER = [20.0, 0.0];
const DEFAULT_ZOOM = 2;

export default function MapView({ trips = [], onLocationClick }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const markers = useMemo(() => {
    return trips.flatMap((trip) =>
      (trip.locations || []).map((location) => ({
        ...location,
        tripName: trip.name,
        tripId: trip.id
      }))
    );
  }, [trips]);

  if (!isMounted) {
    return <div className="h-96 w-full rounded-lg bg-orange-100 animate-pulse" />;
  }

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="h-96 w-full rounded-xl shadow-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {trips.map((trip) => {
        const coordinates = (trip.locations || []).map((location) => [Number(location.lat), Number(location.lng)]);
        if (coordinates.length < 2) return null;
        return (
          <Polyline key={`path-${trip.id}`} positions={coordinates} color="#f97316" weight={3} opacity={0.7} />
        );
      })}
      {markers.map((marker) => (
        <Marker
          key={`${marker.tripId}-${marker.id}`}
          position={[Number(marker.lat), Number(marker.lng)]}
          eventHandlers={{
            click: () => onLocationClick?.(marker)
          }}
        >
          <Popup>
            <div className="space-y-1">
              <h3 className="font-semibold text-orange-600">{marker.tripName}</h3>
              <p className="text-sm font-medium">
                {marker.city}, {marker.country}
              </p>
              {marker.visited_at ? (
                <p className="text-xs text-gray-500">Visited: {new Date(marker.visited_at).toLocaleDateString()}</p>
              ) : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
