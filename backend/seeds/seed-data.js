import bcrypt from 'bcryptjs';
import db from '../src/infrastructure/database/knex.js';

const DEFAULT_PASSWORD = 'password123';

const demoUser = {
  name: 'Family Traveler',
  email: 'family@example.com',
  role: 'admin',
  subscriptionLevel: 'premium',
};

const roles = [
  {
    name: 'admin',
    description: 'Full administrative access',
  },
  {
    name: 'member',
    description: 'Standard family member with full trip/location access',
  },
  {
    name: 'planner',
    description: 'Can create trips but cannot add locations',
  },
  {
    name: 'editor',
    description: 'Can manage trip locations but cannot create trips',
  },
];

const permissions = [
  {
    action: 'trip:list',
    description: 'List trips visible to the user',
    scope: 'api',
    constraints: {
      scope: {
        admin: 'all',
        default: 'own_or_public',
      },
    },
  },
  {
    action: 'trip:view',
    description: 'View trip details',
    scope: 'api',
    constraints: {
      requireOwnership: true,
      ownershipBypassRoles: ['admin'],
      allowPublic: true,
      messages: {
        ownership: 'Trip is private to its owner',
      },
    },
  },
  {
    action: 'trip:create',
    description: 'Create a new trip',
    scope: 'api',
    constraints: {
      denySubscriptions: ['suspended'],
      messages: {
        subscription: 'Subscription is suspended',
      },
    },
  },
  {
    action: 'location:list',
    description: 'List locations visible to the user',
    scope: 'api',
    constraints: {
      scope: {
        admin: 'all',
        default: 'own_or_public',
      },
    },
  },
  {
    action: 'location:create',
    description: 'Add a location to a trip',
    scope: 'api',
    constraints: {
      requireOwnership: true,
      ownershipBypassRoles: ['admin'],
      messages: {
        ownership: 'Only the trip owner can add locations',
      },
    },
  },
  {
    action: 'admin:user:list',
    description: 'List users for admin panel',
    scope: 'admin',
    constraints: {},
  },
  {
    action: 'admin:user:view',
    description: 'View user details in admin panel',
    scope: 'admin',
    constraints: {},
  },
  {
    action: 'admin:user:update',
    description: 'Update user role/subscription',
    scope: 'admin',
    constraints: {},
  },
];

const rolePermissions = {
  admin: permissions.map((permission) => permission.action),
  member: [
    'trip:list',
    'trip:view',
    'trip:create',
    'location:list',
    'location:create',
  ],
  planner: ['trip:list', 'trip:view', 'trip:create', 'location:list'],
  editor: ['trip:list', 'trip:view', 'location:list', 'location:create'],
};

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
    await trx('role_permissions').del();
    await trx('permissions').del();
    await trx('roles').del();
    await trx('locations').del();
    await trx('trips').del();
    await trx('users').del();

    const insertedRoles = await trx('roles').insert(roles).returning('*');
    const roleIdMap = insertedRoles.reduce((acc, role) => {
      acc[role.name] = role.id;
      return acc;
    }, {});

    const insertedPermissions = await trx('permissions')
      .insert(permissions)
      .returning('*');
    const permissionIdMap = insertedPermissions.reduce((acc, permission) => {
      acc[permission.action] = permission.id;
      return acc;
    }, {});

    const rolePermissionRows = [];
    Object.entries(rolePermissions).forEach(([roleName, actions]) => {
      const roleId = roleIdMap[roleName];
      if (!roleId) return;

      actions.forEach((action) => {
        const permissionId = permissionIdMap[action];
        if (permissionId) {
          rolePermissionRows.push({
            role_id: roleId,
            permission_id: permissionId,
          });
        }
      });
    });

    if (rolePermissionRows.length) {
      await trx('role_permissions').insert(rolePermissionRows);
    }

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const [insertedUser] = await trx('users')
      .insert({
        name: demoUser.name,
        email: demoUser.email,
        password_hash: passwordHash,
        role: demoUser.role,
        subscription_level: demoUser.subscriptionLevel,
      })
      .returning('*');

    const tripIdMap = {};
    for (const trip of trips) {
      const [inserted] = await trx('trips')
        .insert({ ...trip, user_id: insertedUser.id, visibility: 'public' })
        .returning('*');
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
  console.log(
    `Demo user credentials -> email: ${demoUser.email}, password: ${DEFAULT_PASSWORD}`
  );
  await db.destroy();
};

seed().catch((error) => {
  console.error('Seed failed', error);
  db.destroy();
});
