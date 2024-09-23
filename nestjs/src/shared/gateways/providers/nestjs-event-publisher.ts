import { type EventEmitter2 } from '@nestjs/event-emitter';
import { type AnyAppEvent } from '../../core/events/app-event';
import { type EventPublisher } from '../../core/ports/providers/event-publisher';

export class NestJsEventPublisher implements EventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async publish<T extends AnyAppEvent>(event: T) {
    this.eventEmitter.emit(event.type, event);
  }
}
