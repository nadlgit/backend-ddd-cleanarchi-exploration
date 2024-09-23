import { BaseModel, column } from '@adonisjs/lucid/orm'

export abstract class PgSqlAppEvent extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare occurredAt: Date

  @column()
  declare type: string

  @column()
  declare data: unknown

  @column()
  declare status: 'PENDING' | 'PROCESSED'
}
