import Knex from 'knex';

export async function up(knex: Knex) {
	return knex.schema.createTable('itens_point', table => {
		table.increments('id')
			.primary();
		table.integer('item_id')
			.notNullable()
			.references('id')
			.inTable('itens');
		table.integer('point_id')
			.notNullable()
			.references('id')
			.inTable('points');
	})
}

export async function down(knex: Knex) {
	return knex.schema.dropTable('itens');
}
