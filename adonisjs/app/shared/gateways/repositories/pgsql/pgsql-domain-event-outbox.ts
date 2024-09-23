import { type QueryClientContract } from '@adonisjs/lucid/types/database'
import { type AnyAppEvent } from '#shared/core/events/app-event'
import { type DomainEventOutbox } from '#shared/core/ports/repositories/domain-event-outbox'

export abstract class PgSqlDomainEventOutbox<T extends AnyAppEvent>
  implements DomainEventOutbox<T>
{
  constructor(
    private readonly queryClient: QueryClientContract,
    private readonly tableName: string
  ) {}

  async addEvents(events: T[]) {
    await this.queryClient.table(this.tableName).multiInsert(
      events.map(({ id, type, occurredAt, data }) => ({
        id,
        type,
        occurred_at: occurredAt,
        data,
        status: 'PENDING',
      }))
    )
  }

  async fetchPendingEvents() {
    return await this.queryClient
      .from(this.tableName)
      .select({
        id: 'id',
        type: 'type',
        occurredAt: 'occurred_at',
        data: 'data',
      })
      .where('status', 'PENDING')
  }

  async acknowledgeEvents(eventIds: string[]) {
    await this.queryClient
      .from(this.tableName)
      .whereIn('id', eventIds)
      .update({ status: 'PROCESSED' })
  }
}
