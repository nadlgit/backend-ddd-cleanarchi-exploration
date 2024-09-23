import { type QueryClientContract } from '@adonisjs/lucid/types/database'
import {
  type RiderTripHistory,
  type GetRiderTripHistoryQuery,
} from '#trips/core/ports/queries/get-rider-trip-history-query'
import PgSqlTrip from '#trips/gateways/repositories/pgsql/models/pgsql-trip'

export class PgSqlGetRiderTripHistoryQuery implements GetRiderTripHistoryQuery {
  constructor(private readonly queryClient: QueryClientContract) {}

  async execute(riderId: string): Promise<RiderTripHistory> {
    const dbTrips = await PgSqlTrip.findManyBy({ riderId }, { client: this.queryClient })
    const trips = dbTrips.map(
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
