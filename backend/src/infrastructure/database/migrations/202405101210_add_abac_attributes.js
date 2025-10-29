export const up = async (knex) => {
  const hasRole = await knex.schema.hasColumn('users', 'role');
  if (!hasRole) {
    await knex.schema.alterTable('users', (table) => {
      table.string('role').notNullable().defaultTo('member');
      table.string('subscription_level').notNullable().defaultTo('free');
    });
  }

  const hasVisibility = await knex.schema.hasColumn('trips', 'visibility');
  if (!hasVisibility) {
    await knex.schema.alterTable('trips', (table) => {
      table.string('visibility').notNullable().defaultTo('private');
    });
  }
};

export const down = async (knex) => {
  const hasVisibility = await knex.schema.hasColumn('trips', 'visibility');
  if (hasVisibility) {
    await knex.schema.alterTable('trips', (table) => {
      table.dropColumn('visibility');
    });
  }

  const hasRole = await knex.schema.hasColumn('users', 'role');
  if (hasRole) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('role');
      table.dropColumn('subscription_level');
    });
  }
};
