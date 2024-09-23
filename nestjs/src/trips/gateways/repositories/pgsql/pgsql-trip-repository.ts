import { type EntityManager, MoreThanOrEqual } from 'typeorm';
import { type TripRepository } from '../../../core/ports/repositories/trip-repository';
import { Trip } from '../../../core/structures/trip';
import { type TripStatus } from '../../../core/structures/trip-status';
import { PgSqlTrip } from './entities/pgsql-trip';

export class PgSqlTripRepository implements TripRepository {
  constructor(private readonly entityManager: EntityManager) {}

  async findById(id: string): Promise<Trip | null> {
    const dbRepository = this.entityManager.getRepository(PgSqlTrip);
    const dbEntity = await dbRepository.findOneBy({ id });
    if (dbEntity) {
      const {
        id,
        riderId,
        startLocation,
        endLocation,
        bookedOn,
        carCategory,
        price,
        driverId,
        status,
      } = dbEntity;
      return Trip.fromSnapshot({
        id,
        riderId,
        startLocation,
        endLocation,
        bookedOn,
        carCategory,
        price,
        driverId,
        status,
      });
    }
    return null;
  }

  async getRiderTripCountByStatus(
    riderId: string,
  ): Promise<Partial<Record<TripStatus, number>>> {
    const counts: { status: string; count: string }[] =
      await this.entityManager.query(
        'SELECT status, count(*) AS count FROM trips WHERE rider_id = $1 GROUP BY status',
        [riderId],
      );
    return counts.reduce<Partial<Record<TripStatus, number>>>(
      (acc, { status, count }) => {
        acc[status as TripStatus] = Number.parseInt(count);
        return acc;
      },
      {},
    );
  }

  async getRiderTripCountSince(
    riderId: string,
    startDateTime: Date,
  ): Promise<number> {
    const dbRepository = this.entityManager.getRepository(PgSqlTrip);
    const count = await dbRepository.countBy({
      riderId,
      bookedOn: MoreThanOrEqual(startDateTime),
    });
    return count;
  }

  async insert(trip: Trip) {
    return this.save(trip);
  }

  async update(trip: Trip) {
    return this.save(trip);
  }

  private async save(trip: Trip) {
    const {
      id,
      riderId,
      startLocation,
      endLocation,
      bookedOn,
      carCategory,
      price,
      driverId,
      status,
    } = trip.toSnapshot();
    const dbRepository = this.entityManager.getRepository(PgSqlTrip);
    await dbRepository.save(
      dbRepository.create({
        id,
        riderId,
        startLocation,
        endLocation,
        bookedOn,
        carCategory,
        price,
        driverId,
        status,
      }),
    );
  }
}
