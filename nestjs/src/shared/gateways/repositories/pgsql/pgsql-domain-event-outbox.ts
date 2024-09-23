import { type EntityManager, type Repository } from 'typeorm';
import { type AnyAppEvent } from '../../../core/events/app-event';
import { type DomainEventOutbox } from '../../../core/ports/repositories/domain-event-outbox';

export abstract class PgSqlDomainEventOutbox<T extends AnyAppEvent>
  implements DomainEventOutbox<T>
{
  constructor(protected readonly entityManager: EntityManager) {}

  protected abstract get dbRepository(): Repository<any>;

  async addEvents(events: T[]) {
    await this.dbRepository.save(
      events.map(({ id, type, occurredAt, data }) =>
        this.dbRepository.create({
          id,
          type,
          occurredAt,
          data,
          status: 'PENDING',
        }),
      ),
    );
  }

  async fetchPendingEvents() {
    const dbEntities = await this.dbRepository.findBy({
      status: 'PENDING',
    });
    return dbEntities.map(
      ({ id, type, occurredAt, data }) =>
        ({
          id,
          type,
          occurredAt,
          data,
        }) as T,
    );
  }

  async acknowledgeEvents(eventIds: string[]) {
    const dbEntities = await this.dbRepository.findBy(
      eventIds.map((id) => ({ id })),
    );
    await this.dbRepository.save(
      dbEntities.map((event) => ({ ...event, status: 'PROCESSED' })),
    );
  }
}
