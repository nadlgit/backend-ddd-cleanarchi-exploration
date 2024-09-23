import {
  type RiderTripHistory,
  type GetRiderTripHistoryQuery,
} from '#trips/core/ports/queries/get-rider-trip-history-query'
import { type TripSnapshot } from '#trips/core/structures/trip'

export class InMemoryGetRiderTripHistoryQuery implements GetRiderTripHistoryQuery {
  constructor(private readonly getTripSnapshots: () => Promise<TripSnapshot[]>) {}

  async execute(riderId: string): Promise<RiderTripHistory> {
    const snapshots = await this.getTripSnapshots()
    const trips = snapshots
      .filter((snapshot) => snapshot.riderId === riderId)
      .map(
        ({ id, startLocation, endLocation, bookedOn, carCategory, price, driverId, status }) => ({
          tripId: id,
          startLocation,
          endLocation,
          bookedOn,
          carCategory,
          price,
          driverId,
          status,
        })
      )
    return { riderId, trips }
  }
}
