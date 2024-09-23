import { test } from '@japa/runner'
import { PgSqlTestDatabase } from '#shared/test-utils/database/pgsql-test-database'
import { Trip, type TripSnapshot } from '#trips/core/structures/trip'
import PgSqlTrip from '#trips/gateways/repositories/pgsql/models/pgsql-trip'
import { PgSqlTripRepository } from '#trips/gateways/repositories/pgsql/pgsql-trip-repository'

test.group('PostgreSQL trip repository', (group) => {
  let repository: PgSqlTripRepository
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

  const trip4: TripSnapshot = {
    id: 'c85b3eb6-8368-46b0-8111-b6a5cc9f2cc9',
    riderId: 'f1c47471-bbc8-47d4-a158-a5a247a661ac',
    startLocation: 'Start location 4',
    endLocation: 'End location 4',
    bookedOn: new Date('2020-12-01 19:19:47'),
    carCategory: 'NORMAL',
    price: 99,
    driverId: '7471a158-bbc8-47d4-a158-a661aca5a247',
    status: 'CANCELLED',
  }

  const trip5: TripSnapshot = {
    id: '46b03eb6-8368-c85b-8111-b6a5cc9f2cc9',
    riderId: 'f1c47471-bbc8-47d4-a158-a5a247a661ac',
    startLocation: 'Start location 5',
    endLocation: 'End location 5',
    bookedOn: new Date('2020-12-01 22:19:47'),
    carCategory: 'NORMAL',
    price: 155,
    driverId: '7471a158-bbc8-47d4-a158-a661aca5a247',
    status: 'CANCELLED',
  }

  group.setup(async () => {
    db = await PgSqlTestDatabase.setup()
    return async () => {
      await db.teardown()
    }
  })

  group.each.setup(async () => {
    await db.clear()
    repository = new PgSqlTripRepository(db.queryClient)
  })

  test('gets trip given existing trip id', async ({ expect }) => {
    await initDbTrips([trip1, trip2, trip3])
    const trip = await repository.findById(trip1.id)
    expect(trip?.toSnapshot()).toEqual(trip1)
  })

  test('returns null given trip id not found', async ({ expect }) => {
    await initDbTrips([])
    const trip = await repository.findById(trip1.id)
    expect(trip).toBeNull()
  })

  test('counts rider trips for each status', async ({ expect }) => {
    const riderId = 'f1c47471-bbc8-47d4-a158-a5a247a661ac'
    await initDbTrips([
      { ...trip1, riderId, status: 'BOOKED' },
      { ...trip2, riderId, status: 'CONFIRMED' },
      { ...trip3, riderId, status: 'TERMINATED' },
      { ...trip4, riderId, status: 'CANCELLED' },
      { ...trip5, riderId: 'a1587471-bbc8-47d4-f1c4-a5a247a661ac' },
    ])
    const tripCount = await repository.getRiderTripCountByStatus(riderId)
    expect(tripCount).toEqual({
      BOOKED: 1,
      CONFIRMED: 1,
      TERMINATED: 1,
      CANCELLED: 1,
    })
  })

  test('counts only existing trip statuses for rider', async ({ expect }) => {
    const riderId = 'f1c47471-bbc8-47d4-a158-a5a247a661ac'
    await initDbTrips([
      { ...trip1, riderId, status: 'BOOKED' },
      { ...trip2, riderId, status: 'TERMINATED' },
      { ...trip3, riderId, status: 'TERMINATED' },
      { ...trip4, riderId, status: 'TERMINATED' },
      { ...trip5, riderId: 'a1587471-bbc8-47d4-f1c4-a5a247a661ac' },
    ])
    const tripCount = await repository.getRiderTripCountByStatus(riderId)
    expect(tripCount).toEqual({
      BOOKED: 1,
      TERMINATED: 3,
    })
  })

  test('counts rider trips since given date and time', async ({ expect }) => {
    const riderId = 'f1c47471-bbc8-47d4-a158-a5a247a661ac'
    await initDbTrips([
      { ...trip1, riderId, bookedOn: new Date('2020-12-01 14:19:47') },
      { ...trip2, riderId, bookedOn: new Date('2020-12-01 15:00:00') },
      { ...trip3, riderId, bookedOn: new Date('2020-12-02 15:19:47') },
      {
        ...trip4,
        riderId: 'a1587471-bbc8-47d4-f1c4-a5a247a661ac',
        bookedOn: new Date('2020-12-01 15:19:47'),
      },
    ])
    const tripCount = await repository.getRiderTripCountSince(
      riderId,
      new Date('2020-12-01 15:00:00')
    )
    expect(tripCount).toBe(2)
  })

  test('inserts trip', async ({ assert }) => {
    await initDbTrips([trip1])
    await repository.insert(Trip.fromSnapshot(trip2))
    const dbTrips = await PgSqlTrip.all({ client: db.queryClient })
    assert.sameDeepMembers(
      dbTrips.map(
        ({
          id,
          riderId,
          startLocation,
          endLocation,
          bookedOn,
          carCategory,
          price,
          driverId,
          status,
        }) => ({
          id,
          riderId,
          startLocation,
          endLocation,
          bookedOn,
          carCategory,
          price,
          driverId,
          status,
        })
      ),
      [trip1, trip2]
    )
  })

  test('updates trip', async ({ assert }) => {
    const initialTrip: TripSnapshot = {
      ...trip2,
      riderId: 'f1c47471-bbc8-47d4-a158-a5a247a661ac',
      startLocation: 'Start location',
      endLocation: 'End location',
      bookedOn: new Date('2020-12-01 08:19:47'),
      carCategory: 'NORMAL',
      price: 10.25,
      driverId: '7471a158-bbc8-47d4-a158-a661aca5a247',
      status: 'CONFIRMED',
    }
    await initDbTrips([trip1, initialTrip, trip3])
    const updatedTrip: TripSnapshot = {
      ...initialTrip,
      riderId: '7471f1c4-bbc8-47d4-a158-a5a247a661ac',
      startLocation: 'Start location NEW',
      endLocation: 'End location NEW',
      bookedOn: new Date('1999-12-01 08:19:47'),
      carCategory: 'UBERX',
      price: 50,
      driverId: null,
      status: 'BOOKED',
    }
    await repository.update(Trip.fromSnapshot(updatedTrip))
    const dbTrips = await PgSqlTrip.all({ client: db.queryClient })
    assert.sameDeepMembers(
      dbTrips.map(
        ({
          id,
          riderId,
          startLocation,
          endLocation,
          bookedOn,
          carCategory,
          price,
          driverId,
          status,
        }) => ({
          id,
          riderId,
          startLocation,
          endLocation,
          bookedOn,
          carCategory,
          price,
          driverId,
          status,
        })
      ),
      [trip1, updatedTrip, trip3]
    )
  })
})
