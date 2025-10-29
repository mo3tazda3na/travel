export const up = async (knex) => {
  await knex.schema.createTable('roles', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('permissions', (table) => {
    table.increments('id').primary();
    table.string('action').notNullable().unique();
    table.string('description');
    table.string('effect').notNullable().defaultTo('allow');
    table.jsonb('constraints');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('role_permissions', (table) => {
    table
      .integer('role_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('roles')
      .onDelete('CASCADE');
    table
      .integer('permission_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('permissions')
      .onDelete('CASCADE');

    table.primary(['role_id', 'permission_id']);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
};
