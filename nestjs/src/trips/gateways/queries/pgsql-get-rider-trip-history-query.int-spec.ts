import { PgSqlTestDatabase } from '../../../shared/test-utils/database/pgsql-test-database';
import { type TripSnapshot } from '../../core/structures/trip';
import { PgSqlTrip } from '../repositories/pgsql/entities/pgsql-trip';
import { PgSqlGetRiderTripHistoryQuery } from './pgsql-get-rider-trip-history-query';

describe('PostgreSQL rider trip history query', () => {
  let query: PgSqlGetRiderTripHistoryQuery;
  let db: PgSqlTestDatabase;
  const initDbTrips = async (trips: TripSnapshot[]) => {
    const dbTrips = trips.map((trip) =>
      db.entityManager.create(PgSqlTrip, trip),
    );
    await db.entityManager.save(dbTrips);
  };

  const trip1: TripSnapshot = {
    id: 'b6a53eb6-8368-46b0-8111-c85bcc9f2cc9',
    riderId: 'f1c47471-bbc8-47d4-a158-a5a247a661ac',
    startLocation: 'Start location 1',
    endLocation: 'End location 1',
    bookedOn: new Date('2020-12-01 01:19:47'),
    carCategory: 'NORMAL',
    price: 5,
    driverId: null,
    status: 'BOOKED',
  };

  const trip2: TripSnapshot = {
    id: '3eb6b6a5-8368-46b0-8111-c85bcc9f2cc9',
    riderId: 'f1c47471-bbc8-47d4-a158-a5a247a661ac',
    startLocation: 'Start location 2',
    endLocation: 'End location 2',
    bookedOn: new Date('2020-12-01 08:19:47'),
    carCategory: 'UBERX',
    price: 10.25,
    driverId: '7471a158-bbc8-47d4-a158-a661aca5a247',
    status: 'CONFIRMED',
  };

  const trip3: TripSnapshot = {
    id: '2cc93eb6-8368-46b0-8111-c85bcc9fb6a5',
    riderId: 'f1c47471-bbc8-47d4-a158-a5a247a661ac',
    startLocation: 'Start location 3',
    endLocation: 'End location 3',
    bookedOn: new Date('2020-12-01 15:19:47'),
    carCategory: 'NORMAL',
    price: 54.77,
    driverId: '7471a158-bbc8-47d4-a158-a661aca5a247',
    status: 'TERMINATED',
  };

  beforeAll(async () => {
    db = await PgSqlTestDatabase.setup();
  });

  beforeEach(async () => {
    await db.clear();
    query = new PgSqlGetRiderTripHistoryQuery(db.entityManager);
  });

  afterAll(async () => {
    await db.teardown();
  });

  it('gets rider trip history', async () => {
    const riderId = 'f1c47471-bbc8-47d4-a158-a5a247a661ac';
    const otherRiderId = 'a1587471-bbc8-47d4-f1c4-a5a247a661ac';
    await initDbTrips([
      { ...trip1, riderId: otherRiderId },
      { ...trip2, riderId },
      { ...trip3, riderId },
    ]);
    const expectedHistoryTrips = [
      {
        tripId: trip2.id,
        startLocation: trip2.startLocation,
        endLocation: trip2.endLocation,
        bookedOn: trip2.bookedOn,
        carCategory: trip2.carCategory,
        price: trip2.price,
        driverId: trip2.driverId,
        status: trip2.status,
      },
      {
        tripId: trip3.id,
        startLocation: trip3.startLocation,
        endLocation: trip3.endLocation,
        bookedOn: trip3.bookedOn,
        carCategory: trip3.carCategory,
        price: trip3.price,
        driverId: trip3.driverId,
        status: trip3.status,
      },
    ];

    const history = await query.execute(riderId);

    expect(history).toEqual({ riderId, trips: history.trips });
    expect(history.trips).toHaveLength(expectedHistoryTrips.length);
    for (const trip of expectedHistoryTrips) {
      expect(history.trips).toContainEqual(trip);
    }
  });
});
