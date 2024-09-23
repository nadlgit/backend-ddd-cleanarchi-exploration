import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'riders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.date('birth_date').notNullable()
      table.string('plan').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
