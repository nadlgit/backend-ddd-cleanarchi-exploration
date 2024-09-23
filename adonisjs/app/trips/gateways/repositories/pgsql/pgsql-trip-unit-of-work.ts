import { type QueryClientContract } from '@adonisjs/lucid/types/database'
import { PgSqlUnitOfWork } from '#shared/gateways/repositories/pgsql/pgsql-unit-of-work'
import {
  type TripUnitOfWork,
  type TripUnitOfWorkRepositories,
} from '#trips/core/ports/repositories/trip-unit-of-work'
import { PgSqlRiderRepository } from '#trips/gateways/repositories/pgsql/pgsql-rider-repository'
import { PgSqlTripDomainEventOutbox } from '#trips/gateways/repositories/pgsql/pgsql-trip-domain-event-outbox'
import { PgSqlTripRepository } from '#trips/gateways/repositories/pgsql/pgsql-trip-repository'

export class PgSqlTripUnitOfWork
  extends PgSqlUnitOfWork<TripUnitOfWorkRepositories>
  implements TripUnitOfWork
{
  protected createRepositories(client: QueryClientContract) {
    return {
      domainEventOutbox: new PgSqlTripDomainEventOutbox(client),
      tripRepository: new PgSqlTripRepository(client),
      riderRepository: new PgSqlRiderRepository(client),
    }
  }
}
