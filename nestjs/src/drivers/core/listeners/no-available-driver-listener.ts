import { type AppEventListener } from '../../../shared/core/events/app-event-listener';
import { ExternalNoDriverAvailable } from '../../../shared/core/events/external-no-driver-available';
import { type EventPublisher } from '../../../shared/core/ports/providers/event-publisher';
import { type NoDriverAvailable } from '../events/no-driver-available';

export class NoDriverAvailableListener
  implements AppEventListener<NoDriverAvailable>
{
  public readonly eventType = 'NO_DRIVER_AVAILABLE';
  public readonly eventHandlers = [
    // NB: arrow functions to ensure 'this' refers to class instance
    (event: NoDriverAvailable) =>
      this.publishExternalNoDriverAvailableEvent(event),
  ];

  constructor(private readonly eventPublisher: EventPublisher) {}

  async publishExternalNoDriverAvailableEvent({
    id,
    occurredAt,
    data,
  }: NoDriverAvailable) {
    await this.eventPublisher.publish(
      new ExternalNoDriverAvailable({
        id,
        occurredAt,
        data: {
          tripId: data.tripId,
        },
      }),
    );
  }
}
