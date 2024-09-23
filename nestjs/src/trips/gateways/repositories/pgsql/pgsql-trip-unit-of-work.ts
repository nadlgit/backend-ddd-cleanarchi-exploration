import { type EntityManager } from 'typeorm';
import { PgSqlUnitOfWork } from '../../../../shared/gateways/repositories/pgsql/pgsql-unit-of-work';
import {
  type TripUnitOfWork,
  type TripUnitOfWorkRepositories,
} from '../../../core/ports/repositories/trip-unit-of-work';
import { PgSqlRiderRepository } from './pgsql-rider-repository';
import { PgSqlTripDomainEventOutbox } from './pgsql-trip-domain-event-outbox';
import { PgSqlTripRepository } from './pgsql-trip-repository';

export class PgSqlTripUnitOfWork
  extends PgSqlUnitOfWork<TripUnitOfWorkRepositories>
  implements TripUnitOfWork
{
  protected createRepositories(manager: EntityManager) {
    return {
      domainEventOutbox: new PgSqlTripDomainEventOutbox(manager),
      tripRepository: new PgSqlTripRepository(manager),
      riderRepository: new PgSqlRiderRepository(manager),
    };
  }
}
