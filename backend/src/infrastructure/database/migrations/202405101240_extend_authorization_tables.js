export const up = async (knex) => {
  const hasScope = await knex.schema.hasColumn('permissions', 'scope');
  if (!hasScope) {
    await knex.schema.alterTable('permissions', (table) => {
      table.string('scope').notNullable().defaultTo('api');
    });
  }
};

export const down = async (knex) => {
  const hasScope = await knex.schema.hasColumn('permissions', 'scope');
  if (hasScope) {
    await knex.schema.alterTable('permissions', (table) => {
      table.dropColumn('scope');
    });
  }
};
