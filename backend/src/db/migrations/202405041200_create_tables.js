export const up = async (knex) => {
  await knex.schema.createTable('trips', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.date('start_date').notNullable();
    table.date('end_date');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('locations', (table) => {
    table.increments('id').primary();
    table
      .integer('trip_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('trips')
      .onDelete('CASCADE');
    table.string('city').notNullable();
    table.string('country').notNullable();
    table.decimal('lat', 9, 6).notNullable();
    table.decimal('lng', 9, 6).notNullable();
    table.text('notes');
    table.string('image_url');
    table.date('visited_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('locations');
  await knex.schema.dropTableIfExists('trips');
};
