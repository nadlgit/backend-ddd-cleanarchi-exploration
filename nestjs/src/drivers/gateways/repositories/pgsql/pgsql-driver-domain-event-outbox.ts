import { PgSqlDomainEventOutbox } from '../../../../shared/gateways/repositories/pgsql/pgsql-domain-event-outbox';
import { type DriverDomainEvent } from '../../../core/events/driver-domain-event';
import { PgSqlDriverDomainEvent } from './entities/pgsql-driver-domain-event';

export class PgSqlDriverDomainEventOutbox extends PgSqlDomainEventOutbox<DriverDomainEvent> {
  protected get dbRepository() {
    return this.entityManager.getRepository(PgSqlDriverDomainEvent);
  }
}
