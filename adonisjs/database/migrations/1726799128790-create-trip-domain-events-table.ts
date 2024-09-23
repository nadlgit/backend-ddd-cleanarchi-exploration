import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'trip_domain_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.timestamp('occurred_at', { useTz: true }).notNullable()
      table.string('type').notNullable()
      table.json('data').notNullable()
      table.string('status').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
