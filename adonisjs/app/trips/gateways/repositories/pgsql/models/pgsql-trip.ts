import { BaseModel, column } from '@adonisjs/lucid/orm'
import { type CarCategory } from '#shared/core/structures/car-category'
import { type TripStatus } from '#trips/core/structures/trip-status'

export default class PgSqlTrip extends BaseModel {
  static table = 'trips'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare riderId: string

  @column()
  declare startLocation: string

  @column()
  declare endLocation: string

  @column()
  declare bookedOn: Date

  @column()
  declare carCategory: CarCategory

  @column({ consume: (value: string) => Number.parseFloat(value) })
  declare price: number

  @column()
  declare driverId: string | null

  @column()
  declare status: TripStatus
}
