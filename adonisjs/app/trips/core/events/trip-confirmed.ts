import { type AppEvent } from '#shared/core/events/app-event'

type EventData = {
  tripId: string
}

export class TripConfirmed implements AppEvent<'TRIP_CONFIRMED', EventData> {
  public readonly id: string
  public readonly occurredAt: Date
  public readonly type = 'TRIP_CONFIRMED'
  public readonly data: EventData

  constructor({ id, occurredAt, data }: { id: string; occurredAt: Date; data: EventData }) {
    this.id = id
    this.occurredAt = occurredAt
    this.data = data
  }
}
