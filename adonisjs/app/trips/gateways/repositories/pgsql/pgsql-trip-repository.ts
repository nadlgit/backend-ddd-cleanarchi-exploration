import { type QueryClientContract } from '@adonisjs/lucid/types/database'
import { type TripRepository } from '#trips/core/ports/repositories/trip-repository'
import { Trip } from '#trips/core/structures/trip'
import { type TripStatus } from '#trips/core/structures/trip-status'
import PgSqlTrip from '#trips/gateways/repositories/pgsql/models/pgsql-trip'

export class PgSqlTripRepository implements TripRepository {
  constructor(private readonly queryClient: QueryClientContract) {}

  async findById(id: string): Promise<Trip | null> {
    const dbTrip = await PgSqlTrip.findBy({ id }, { client: this.queryClient })
    if (dbTrip) {
      return Trip.fromSnapshot({
        id,
        riderId: dbTrip.riderId,
        startLocation: dbTrip.startLocation,
        endLocation: dbTrip.endLocation,
        bookedOn: dbTrip.bookedOn,
        carCategory: dbTrip.carCategory,
        price: dbTrip.price,
        driverId: dbTrip.driverId,
        status: dbTrip.status,
      })
    }
    return null
  }

  async getRiderTripCountByStatus(riderId: string): Promise<Partial<Record<TripStatus, number>>> {
    const result = await this.queryClient
      .from(PgSqlTrip.table)
      .where('rider_id', riderId)
      .select('status')
      .count('* as count')
      .groupBy('status')
    return result.reduce<Partial<Record<TripStatus, number>>>((acc, { status, count }) => {
      acc[status as TripStatus] = Number.parseInt(count)
      return acc
    }, {})
  }

  async getRiderTripCountSince(riderId: string, startDateTime: Date): Promise<number> {
    const result = await this.queryClient
      .from(PgSqlTrip.table)
      .where('rider_id', riderId)
      .where('booked_on', '>=', startDateTime)
      .count('* as total')
    return Number.parseInt(result[0].total)
  }

  async insert(trip: Trip) {
    return this.save(trip)
  }

  async update(trip: Trip) {
    return this.save(trip)
  }

  private async save(trip: Trip) {
    const snapshot = trip.toSnapshot()
    await PgSqlTrip.updateOrCreate({ id: snapshot.id }, snapshot, { client: this.queryClient })
  }
}
