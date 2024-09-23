import { type AppEvent } from '#shared/core/events/app-event'

type EventData = {
  driverId: string
  tripId: string
}

export class DriverMatched implements AppEvent<'DRIVER_MATCHED', EventData> {
  public readonly id: string
  public readonly occurredAt: Date
  public readonly type = 'DRIVER_MATCHED'
  public readonly data: EventData

  constructor({ id, occurredAt, data }: { id: string; occurredAt: Date; data: EventData }) {
    this.id = id
    this.occurredAt = occurredAt
    this.data = data
  }
}
