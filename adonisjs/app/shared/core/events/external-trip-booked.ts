import { type AppEvent } from '#shared/core/events/app-event'
import { type CarCategory } from '#shared/core/structures/car-category'

type EventData = {
  tripId: string
  startLocation: string
  endLocation: string
  carCategory: CarCategory
}

export class ExternalTripBooked implements AppEvent<'EXT_TRIP_BOOKED', EventData> {
  public readonly id: string
  public readonly occurredAt: Date
  public readonly type = 'EXT_TRIP_BOOKED'
  public readonly data: EventData

  constructor({ id, occurredAt, data }: { id: string; occurredAt: Date; data: EventData }) {
    this.id = id
    this.occurredAt = occurredAt
    this.data = data
  }
}
