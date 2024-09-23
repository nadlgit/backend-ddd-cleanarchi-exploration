import { type AnyAppEvent } from '#shared/core/events/app-event'
import { type EventPublisher } from '#shared/core/ports/providers/event-publisher'
import { type DomainEventOutbox } from '#shared/core/ports/repositories/domain-event-outbox'
import { type UnitOfWork } from '#shared/core/ports/repositories/unit-of-work'

export class DomainEventService<
  T extends AnyAppEvent,
  R extends { domainEventOutbox: DomainEventOutbox<T> },
> {
  private intervalId: NodeJS.Timeout | null = null

  constructor(
    private readonly unitOfWork: UnitOfWork<R>,
    private readonly publisher: EventPublisher,
    private readonly POLL_INTERVAL_MS = 500
  ) {}

  async publishPendingEvents() {
    const events = await this.unitOfWork.execute(async ({ domainEventOutbox }) =>
      domainEventOutbox.fetchPendingEvents()
    )
    await Promise.all(
      events.map(async (event) => {
        await this.publisher.publish<T>(event)
        await this.unitOfWork.execute(async ({ domainEventOutbox }) =>
          domainEventOutbox.acknowledgeEvents([event.id])
        )
      })
    )
  }

  startPollingEvents() {
    this.intervalId = setInterval(
      () => this.publishPendingEvents(), // NB: arrow function to ensure 'this' refers to class instance
      this.POLL_INTERVAL_MS
    )
  }

  stopPollingEvents() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
