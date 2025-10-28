'use client';

import { useState } from 'react';

const initialForm = {
  city: '',
  country: '',
  lat: '',
  lng: '',
  notes: '',
  image_url: '',
  visited_at: ''
};

export default function AddLocationForm({ tripId, onLocationCreated }) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!tripId) {
      setError('Select a trip before adding a location.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const latValue = Number(form.lat);
      const lngValue = Number(form.lng);

      if (Number.isNaN(latValue) || Number.isNaN(lngValue)) {
        throw new Error('Latitude and longitude must be valid numbers');
      }

      const payload = {
        ...form,
        trip_id: tripId,
        lat: latValue,
        lng: lngValue,
        image_url: form.image_url || null,
        notes: form.notes || '',
        visited_at: form.visited_at || null
      };

      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body?.message || body?.error || 'Failed to add location');
      }

      const newLocation = await response.json();
      setForm(initialForm);
      onLocationCreated?.(newLocation);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-orange-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-orange-600">Add Location</h3>
        <span className="text-xs text-gray-500">Trip #{tripId || '—'}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-gray-700">
          City
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            placeholder="Florence"
            className="mt-1 w-full rounded-md border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-700">
          Country
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            required
            placeholder="Italy"
            className="mt-1 w-full rounded-md border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-700">
          Latitude
          <input
            name="lat"
            type="number"
            step="any"
            value={form.lat}
            onChange={handleChange}
            required
            placeholder="43.7696"
            className="mt-1 w-full rounded-md border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-700">
          Longitude
          <input
            name="lng"
            type="number"
            step="any"
            value={form.lng}
            onChange={handleChange}
            required
            placeholder="11.2558"
            className="mt-1 w-full rounded-md border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-700 sm:col-span-2">
          Notes
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Highlights, favorite meals, or memories"
            className="mt-1 w-full rounded-md border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none"
            rows={3}
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-700">
          Visited Date
          <input
            type="date"
            name="visited_at"
            value={form.visited_at}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-700">
          Image URL
          <input
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
            className="mt-1 w-full rounded-md border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none"
          />
        </label>
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <button
        type="submit"
        disabled={!tripId || isSubmitting}
        className="w-full rounded-md bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Add Location'}
      </button>
    </form>
  );
}
