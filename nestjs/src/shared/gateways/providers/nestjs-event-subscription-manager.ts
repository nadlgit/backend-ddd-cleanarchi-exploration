import { type EventEmitter2 } from '@nestjs/event-emitter';
import { type AnyAppEvent } from '../../core/events/app-event';
import { EventSubscriptionManager } from '../../core/ports/providers/event-subscription-manager';

export class NestJsEventSubscriptionManager
  implements EventSubscriptionManager
{
  constructor(private readonly eventEmitter: EventEmitter2) {}

  addListener<T extends AnyAppEvent>(
    eventType: T['type'],
    listener: (event: T) => void | Promise<void>,
  ) {
    this.eventEmitter.on(eventType, listener);
  }

  removeListener<T extends AnyAppEvent>(
    eventType: T['type'],
    listener: (event: T) => void | Promise<void>,
  ) {
    this.eventEmitter.off(eventType, listener);
  }
}
