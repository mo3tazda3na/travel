'use client';

import { useState } from 'react';

const initialForm = {
  name: '',
  description: '',
  start_date: '',
  end_date: ''
};

export default function AddTripForm({ onTripCreated }) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body?.message || body?.error || 'Failed to create trip');
      }

      const newTrip = await response.json();
      setForm(initialForm);
      onTripCreated?.(newTrip);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-orange-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-orange-600">Add a New Trip</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-gray-700">
          Trip Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Family Adventure"
            className="mt-1 w-full rounded-md border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-700">
          Start Date
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-md border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-700">
          End Date
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-700 sm:col-span-2">
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short notes about why this trip is exciting"
            className="mt-1 w-full rounded-md border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none"
            rows={3}
          />
        </label>
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save Trip'}
      </button>
    </form>
  );
}
