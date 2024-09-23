import { test } from '@japa/runner'
import { Driver, type DriverSnapshot } from '#drivers/core/structures/driver'
import PgSqlDriver from '#drivers/gateways/repositories/pgsql/models/pgsql-driver'
import { PgSqlDriverRepository } from '#drivers/gateways/repositories/pgsql/pgsql-driver-repository'
import { PgSqlTestDatabase } from '#shared/test-utils/database/pgsql-test-database'

test.group('PostgreSQL driver repository', (group) => {
  let repository: PgSqlDriverRepository
  let db: PgSqlTestDatabase
  const initDbDrivers = async (drivers: DriverSnapshot[]) => {
    await PgSqlDriver.createMany(drivers, { client: db.queryClient })
  }

  const driver1: DriverSnapshot = {
    id: '7471f1c4-bbc8-47d4-a158-a661aca5a247',
    name: 'John Doe',
    carCategory: 'NORMAL',
    isAvailable: false,
    location: 'Driver location 1',
    currentTripId: 'b6a53eb6-8368-46b0-8111-c85bcc9f2cc9',
  }

  const driver2: DriverSnapshot = {
    id: 'f1c47471-bbc8-47d4-a158-a661aca5a247',
    name: 'Jane Doe',
    carCategory: 'NORMAL',
    isAvailable: false,
    location: 'Driver location 2',
    currentTripId: null,
  }

  const driver3: DriverSnapshot = {
    id: 'a247f1c4-bbc8-47d4-a158-a661aca57471',
    name: 'Sam Doe',
    carCategory: 'NORMAL',
    isAvailable: false,
    location: null,
    currentTripId: null,
  }

  group.setup(async () => {
    db = await PgSqlTestDatabase.setup()
    return async () => {
      await db.teardown()
    }
  })

  group.each.setup(async () => {
    await db.clear()
    repository = new PgSqlDriverRepository(db.queryClient)
  })

  test('finds available drivers', async ({ expect }) => {
    await initDbDrivers([
      driver1,
      { ...driver2, isAvailable: true },
      { ...driver3, isAvailable: true },
    ])
    const drivers = await repository.findAvailableDrivers()
    expect(drivers.map((driver) => driver.toSnapshot())).toEqual([
      { ...driver2, isAvailable: true },
      { ...driver3, isAvailable: true },
    ])
  })

  test('updates driver', async ({ assert }) => {
    const initialDriver: DriverSnapshot = {
      ...driver2,
      name: 'Jane Doe',
      carCategory: 'UBERX',
      isAvailable: true,
      location: 'Driver location 2',
      currentTripId: null,
    }
    await initDbDrivers([driver1, initialDriver, driver3])

    const updatedDriver: DriverSnapshot = {
      ...initialDriver,
      name: 'Jennifer Doe',
      carCategory: 'NORMAL',
      isAvailable: false,
      location: null,
      currentTripId: '2cc93eb6-8368-46b0-8111-c85bcc9fb6a5',
    }
    await repository.update(Driver.fromSnapshot(updatedDriver))

    const dbDrivers = await PgSqlDriver.all({ client: db.queryClient })
    assert.sameDeepMembers(
      dbDrivers.map(({ id, name, carCategory, isAvailable, location, currentTripId }) => ({
        id,
        name,
        carCategory,
        isAvailable,
        location,
        currentTripId,
      })),
      [driver1, updatedDriver, driver3]
    )
  })
})
