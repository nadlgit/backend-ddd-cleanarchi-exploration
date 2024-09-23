import { type EntityManager } from 'typeorm';
import {
  type RiderTripHistory,
  type GetRiderTripHistoryQuery,
} from '../../core/ports/queries/get-rider-trip-history-query';
import { PgSqlTrip } from '../repositories/pgsql/entities/pgsql-trip';

export class PgSqlGetRiderTripHistoryQuery implements GetRiderTripHistoryQuery {
  constructor(private readonly entityManager: EntityManager) {}

  async execute(riderId: string): Promise<RiderTripHistory> {
    const dbRepository = this.entityManager.getRepository(PgSqlTrip);
    const dbTrips = await dbRepository.findBy({ riderId });
    const trips = dbTrips.map(
      ({
        id,
        startLocation,
        endLocation,
        bookedOn,
        carCategory,
        price,
        driverId,
        status,
      }) => ({
        tripId: id,
        startLocation,
        endLocation,
        bookedOn,
        carCategory,
        price,
        driverId,
        status,
      }),
    );
    return { riderId, trips };
  }
}
