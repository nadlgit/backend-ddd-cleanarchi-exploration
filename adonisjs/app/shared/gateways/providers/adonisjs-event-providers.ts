import emitter from '@adonisjs/core/services/emitter'
import { type EventsList } from '@adonisjs/core/types'
import { type AnyAppEvent } from '#shared/core/events/app-event'
import { type EventPublisher } from '#shared/core/ports/providers/event-publisher'
import { type EventSubscriptionManager } from '#shared/core/ports/providers/event-subscription-manager'

export class AdonisJsEventPublisher implements EventPublisher {
  async publish<T extends AnyAppEvent>(event: T) {
    emitter.emit(event.type as keyof EventsList, event as EventsList[keyof EventsList])
  }
}

export class AdonisJsEventSubscriptionManager implements EventSubscriptionManager {
  addListener<T extends AnyAppEvent>(
    eventType: T['type'],
    listener: (event: T) => void | Promise<void>
  ) {
    emitter.on(
      eventType as keyof EventsList,
      listener as (event: EventsList[keyof EventsList]) => void | Promise<void>
    )
  }

  removeListener<T extends AnyAppEvent>(
    eventType: T['type'],
    listener: (event: T) => void | Promise<void>
  ) {
    emitter.off(
      eventType as keyof EventsList,
      listener as (event: EventsList[keyof EventsList]) => void | Promise<void>
    )
  }
}
