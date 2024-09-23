import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'trips'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.uuid('rider_id').notNullable()
      table.text('start_location').notNullable()
      table.text('end_location').notNullable()
      table.timestamp('booked_on', { useTz: true }).notNullable()
      table.string('car_category').notNullable()
      table.decimal('price', 8, 2)
      table.uuid('driver_id')
      table.string('status').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
