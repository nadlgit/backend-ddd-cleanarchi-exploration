import { PgSqlDomainEventOutbox } from '../../../../shared/gateways/repositories/pgsql/pgsql-domain-event-outbox';
import { type TripDomainEvent } from '../../../core/events/trip-domain-event';
import { PgSqlTripDomainEvent } from './entities/pgsql-trip-domain-event';

export class PgSqlTripDomainEventOutbox extends PgSqlDomainEventOutbox<TripDomainEvent> {
  protected get dbRepository() {
    return this.entityManager.getRepository(PgSqlTripDomainEvent);
  }
}
