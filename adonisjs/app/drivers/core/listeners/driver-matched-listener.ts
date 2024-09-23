import { type DriverMatched } from '#drivers/core/events/driver-matched'
import { type AppEventListener } from '#shared/core/events/app-event-listener'
import { ExternalDriverMatched } from '#shared/core/events/external-driver-matched'
import { type EventPublisher } from '#shared/core/ports/providers/event-publisher'

export class DriverMatchedListener implements AppEventListener<DriverMatched> {
  public readonly eventType = 'DRIVER_MATCHED'
  public readonly eventHandlers = [
    // NB: arrow functions to ensure 'this' refers to class instance
    (event: DriverMatched) => this.publishExternalDriverMatchedEvent(event),
  ]

  constructor(private readonly eventPublisher: EventPublisher) {}

  async publishExternalDriverMatchedEvent({ id, occurredAt, data }: DriverMatched) {
    await this.eventPublisher.publish(
      new ExternalDriverMatched({
        id,
        occurredAt,
        data: {
          driverId: data.driverId,
          tripId: data.tripId,
        },
      })
    )
  }
}
