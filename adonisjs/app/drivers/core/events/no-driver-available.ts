import { type AppEvent } from '#shared/core/events/app-event'

type EventData = {
  tripId: string
}

export class NoDriverAvailable implements AppEvent<'NO_DRIVER_AVAILABLE', EventData> {
  public readonly id: string
  public readonly occurredAt: Date
  public readonly type = 'NO_DRIVER_AVAILABLE'
  public readonly data: EventData

  constructor({ id, occurredAt, data }: { id: string; occurredAt: Date; data: EventData }) {
    this.id = id
    this.occurredAt = occurredAt
    this.data = data
  }
}
