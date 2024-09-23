import { type AnyAppEvent } from '#shared/core/events/app-event'
import { type AppEventListener } from '#shared/core/events/app-event-listener'
import { type EventSubscriptionManager } from '#shared/core/ports/providers/event-subscription-manager'

export class AppEventSubscription<T extends AnyAppEvent> {
  constructor(
    private readonly eventManager: EventSubscriptionManager,
    private readonly eventListeners: {
      [K in T['type']]: AppEventListener<Extract<T, { type: K }>>
    }[T['type']][]
  ) {}

  registerAllListeners() {
    for (const listener of this.eventListeners) {
      for (const handler of listener.eventHandlers) {
        this.eventManager.addListener<Extract<T, { type: typeof listener.eventType }>>(
          listener.eventType,
          handler
        )
      }
    }
  }

  unregisterAllListeners() {
    for (const listener of this.eventListeners) {
      for (const handler of listener.eventHandlers) {
        this.eventManager.removeListener<Extract<T, { type: typeof listener.eventType }>>(
          listener.eventType,
          handler
        )
      }
    }
  }
}
