import { BaseModel, column } from '@adonisjs/lucid/orm'
import { format } from 'date-fns'
import { type RiderPlan } from '#trips/core/structures/rider-plan'

export default class PgSqlRider extends BaseModel {
  static table = 'riders'

  @column({ isPrimary: true })
  declare id: string

  @column({ consume: (value: Date) => format(value, 'yyyy-MM-dd') })
  declare birthDate: string

  @column()
  declare plan: RiderPlan
}
