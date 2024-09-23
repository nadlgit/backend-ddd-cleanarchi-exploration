import { type QueryClientContract } from '@adonisjs/lucid/types/database'
import { type DriverDomainEvent } from '#drivers/core/events/driver-domain-event'
import PgSqlDriverDomainEvent from '#drivers/gateways/repositories/pgsql/models/pgsql-driver-domain-event'
import { PgSqlDomainEventOutbox } from '#shared/gateways/repositories/pgsql/pgsql-domain-event-outbox'

export class PgSqlDriverDomainEventOutbox extends PgSqlDomainEventOutbox<DriverDomainEvent> {
  constructor(queryClient: QueryClientContract) {
    super(queryClient, PgSqlDriverDomainEvent.table)
  }
}
