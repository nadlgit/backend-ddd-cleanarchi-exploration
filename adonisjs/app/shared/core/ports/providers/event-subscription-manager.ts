import { type AnyAppEvent } from '#shared/core/events/app-event'

type EventSubscription = <T extends AnyAppEvent>(
  eventType: T['type'],
  listener: (event: T) => void | Promise<void>
) => void

export abstract class EventSubscriptionManager {
  abstract addListener: EventSubscription
  abstract removeListener: EventSubscription
}
