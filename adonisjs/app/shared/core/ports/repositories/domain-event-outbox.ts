import { type AnyAppEvent } from '#shared/core/events/app-event'

export type DomainEventOutbox<T extends AnyAppEvent> = {
  addEvents: (events: T[]) => Promise<void>
  fetchPendingEvents: () => Promise<T[]>
  acknowledgeEvents: (eventIds: string[]) => Promise<void>
}
