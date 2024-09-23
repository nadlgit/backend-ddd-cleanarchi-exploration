import { test } from '@japa/runner'
import { PgSqlTestDatabase } from '#shared/test-utils/database/pgsql-test-database'
import { type TripSnapshot } from '#trips/core/structures/trip'
import { PgSqlGetRiderTripHistoryQuery } from '#trips/gateways/queries/pgsql-get-rider-trip-history-query'
import PgSqlTrip from '#trips/gateways/repositories/pgsql/models/pgsql-trip'

test.group('PostgreSQL rider trip history query', (group) => {
  let query: PgSqlGetRiderTripHistoryQuery
  let db: PgSqlTestDatabase
  const initDbTrips = async (trips: TripSnapshot[]) => {
    await PgSqlTrip.createMany(trips, { client: db.queryClient })
  }

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
  }

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
  }

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
  }

  group.setup(async () => {
    db = await PgSqlTestDatabase.setup()
    return async () => {
      await db.teardown()
    }
  })

  group.each.setup(async () => {
    await db.clear()
    query = new PgSqlGetRiderTripHistoryQuery(db.queryClient)
  })

  test('gets rider trip history', async ({ assert }) => {
    const riderId = 'f1c47471-bbc8-47d4-a158-a5a247a661ac'
    const otherRiderId = 'a1587471-bbc8-47d4-f1c4-a5a247a661ac'
    await initDbTrips([
      { ...trip1, riderId: otherRiderId },
      { ...trip2, riderId },
      { ...trip3, riderId },
    ])

    const history = await query.execute(riderId)

    assert.deepEqual(history, { riderId, trips: history.trips })
    assert.sameDeepMembers(history.trips, [
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
    ])
  })
})
