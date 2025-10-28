import db from '../src/db/knex.js';

const trips = [
  {
    name: 'Rome 2025',
    description: 'Exploring ancient history, pasta workshops, and family gelato tours.',
    start_date: '2025-06-10',
    end_date: '2025-06-18'
  },
  {
    name: 'Istanbul 2024',
    description: 'Grand Bazaar shopping, Bosphorus cruise, and Turkish delight tastings.',
    start_date: '2024-04-02',
    end_date: '2024-04-08'
  },
  {
    name: 'Barcelona 2023',
    description: 'Gaudí architecture walks and beach picnics.',
    start_date: '2023-07-14',
    end_date: '2023-07-20'
  }
];

const locations = [
  {
    tripName: 'Rome 2025',
    city: 'Rome',
    country: 'Italy',
    lat: 41.9028,
    lng: 12.4964,
    notes: 'Trevi Fountain wishes and Colosseum tour.',
    image_url: 'https://images.example.com/rome-colosseum.jpg',
    visited_at: '2025-06-11'
  },
  {
    tripName: 'Rome 2025',
    city: 'Vatican City',
    country: 'Vatican City',
    lat: 41.9029,
    lng: 12.4534,
    notes: 'St. Peter\'s Basilica climb.',
    visited_at: '2025-06-12'
  },
  {
    tripName: 'Istanbul 2024',
    city: 'Istanbul',
    country: 'Turkey',
    lat: 41.0082,
    lng: 28.9784,
    notes: 'Blue Mosque sunrise visit.',
    image_url: 'https://images.example.com/istanbul-blue-mosque.jpg',
    visited_at: '2024-04-03'
  },
  {
    tripName: 'Barcelona 2023',
    city: 'Barcelona',
    country: 'Spain',
    lat: 41.3851,
    lng: 2.1734,
    notes: 'Sagrada Família tour with the kids.',
    visited_at: '2023-07-15'
  }
];

const seed = async () => {
  await db.transaction(async (trx) => {
    await trx('locations').del();
    await trx('trips').del();

    const tripIdMap = {};
    for (const trip of trips) {
      const [inserted] = await trx('trips').insert(trip).returning('*');
      tripIdMap[trip.name] = inserted.id;
    }

    for (const location of locations) {
      const { tripName, ...locationData } = location;
      await trx('locations')
        .insert({ ...locationData, trip_id: tripIdMap[tripName] })
        .returning('*');
    }
  });

  console.log('Seed data inserted successfully');
  await db.destroy();
};

seed().catch((error) => {
  console.error('Seed failed', error);
  db.destroy();
});
