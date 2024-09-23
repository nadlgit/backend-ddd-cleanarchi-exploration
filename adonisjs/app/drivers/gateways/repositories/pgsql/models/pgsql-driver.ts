import { BaseModel, column } from '@adonisjs/lucid/orm'
import { type CarCategory } from '#shared/core/structures/car-category'

export default class PgSqlDriver extends BaseModel {
  static table = 'drivers'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare carCategory: CarCategory

  @column()
  declare isAvailable: boolean

  @column()
  declare location: string | null

  @column()
  declare currentTripId: string | null
}
