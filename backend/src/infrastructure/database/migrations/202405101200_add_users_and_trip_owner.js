export const up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  const hasTripUserId = await knex.schema.hasColumn('trips', 'user_id');
  if (!hasTripUserId) {
    await knex.schema.table('trips', (table) => {
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
    });
  }
};

export const down = async (knex) => {
  const hasTripUserId = await knex.schema.hasColumn('trips', 'user_id');
  if (hasTripUserId) {
    await knex.schema.table('trips', (table) => {
      table.dropColumn('user_id');
    });
  }

  await knex.schema.dropTableIfExists('users');
};
