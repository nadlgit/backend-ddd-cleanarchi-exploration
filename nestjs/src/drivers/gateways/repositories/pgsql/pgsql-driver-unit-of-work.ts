import { type EntityManager } from 'typeorm';
import { PgSqlUnitOfWork } from '../../../../shared/gateways/repositories/pgsql/pgsql-unit-of-work';
import {
  type DriverUnitOfWork,
  type DriverUnitOfWorkRepositories,
} from '../../../core/ports/repositories/driver-unit-of-work';
import { PgSqlDriverDomainEventOutbox } from './pgsql-driver-domain-event-outbox';
import { PgSqlDriverRepository } from './pgsql-driver-repository';

export class PgSqlDriverUnitOfWork
  extends PgSqlUnitOfWork<DriverUnitOfWorkRepositories>
  implements DriverUnitOfWork
{
  protected createRepositories(manager: EntityManager) {
    return {
      domainEventOutbox: new PgSqlDriverDomainEventOutbox(manager),
      driverRepository: new PgSqlDriverRepository(manager),
    };
  }
}
