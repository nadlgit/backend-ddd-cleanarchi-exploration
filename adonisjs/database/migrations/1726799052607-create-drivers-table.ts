import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'drivers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.string('name').notNullable()
      table.string('car_category').notNullable()
      table.boolean('is_available').notNullable()
      table.text('location')
      table.uuid('current_trip_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
