import { type QueryClientContract } from '@adonisjs/lucid/types/database'
import {
  type DriverUnitOfWork,
  type DriverUnitOfWorkRepositories,
} from '#drivers/core/ports/repositories/driver-unit-of-work'
import { PgSqlDriverDomainEventOutbox } from '#drivers/gateways/repositories/pgsql/pgsql-driver-domain-event-outbox'
import { PgSqlDriverRepository } from '#drivers/gateways/repositories/pgsql/pgsql-driver-repository'
import { PgSqlUnitOfWork } from '#shared/gateways/repositories/pgsql/pgsql-unit-of-work'

export class PgSqlDriverUnitOfWork
  extends PgSqlUnitOfWork<DriverUnitOfWorkRepositories>
  implements DriverUnitOfWork
{
  protected createRepositories(client: QueryClientContract) {
    return {
      domainEventOutbox: new PgSqlDriverDomainEventOutbox(client),
      driverRepository: new PgSqlDriverRepository(client),
    }
  }
}
