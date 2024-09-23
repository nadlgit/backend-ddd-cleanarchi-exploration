import { type Trip } from '#trips/core/structures/trip'
import { type TripStatus } from '#trips/core/structures/trip-status'

export abstract class TripRepository {
  abstract findById(id: string): Promise<Trip | null>
  abstract getRiderTripCountByStatus(riderId: string): Promise<Partial<Record<TripStatus, number>>>
  abstract getRiderTripCountSince(riderId: string, startDateTime: Date): Promise<number>
  abstract insert(trip: Trip): Promise<void>
  abstract update(trip: Trip): Promise<void>
}
