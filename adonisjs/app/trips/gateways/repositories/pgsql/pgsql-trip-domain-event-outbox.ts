import { type QueryClientContract } from '@adonisjs/lucid/types/database'
import { PgSqlDomainEventOutbox } from '#shared/gateways/repositories/pgsql/pgsql-domain-event-outbox'
import { type TripDomainEvent } from '#trips/core/events/trip-domain-event'
import PgSqlTripDomainEvent from '#trips/gateways/repositories/pgsql/models/pgsql-trip-domain-event'

export class PgSqlTripDomainEventOutbox extends PgSqlDomainEventOutbox<TripDomainEvent> {
  constructor(queryClient: QueryClientContract) {
    super(queryClient, PgSqlTripDomainEvent.table)
  }
}
