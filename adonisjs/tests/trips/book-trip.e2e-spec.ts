import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import { setTimeout } from 'node:timers/promises'
import PgSqlDriver from '#drivers/gateways/repositories/pgsql/models/pgsql-driver'
import { DateProvider } from '#shared/core/ports/providers/date-provider'
import { StubDateProvider } from '#shared/test-utils/providers/stub-date-provider'
import PgSqlRider from '#trips/gateways/repositories/pgsql/models/pgsql-rider'
import PgSqlTrip from '#trips/gateways/repositories/pgsql/models/pgsql-trip'

test.group('Feature: Book a trip', (group) => {
  const tripId = '0d60752f-e8e3-480b-9d0c-64624544fee5'
  const rider = {
    id: '8182202e-1e02-4e6b-b328-b8a93c260d2e',
    birthDate: '2000-01-01',
    plan: 'BASIC',
  } as const
  const driver = {
    id: '7471f1c4-bbc8-47d4-a158-a661aca5a247',
    name: 'John Doe',
    carCategory: 'NORMAL',
    isAvailable: true,
    location: '43 boulevard Malesherbes, Paris',
    currentTripId: null,
  } as const
  const startLocation = '2 boulevard Malesherbes, Paris'
  const endLocation = '40 boulevard Malesherbes, Paris'
  const currentDateTime = new Date('2020-12-01 22:19:47')

  const clearDatabase = async () => {
    const queryClient = db.connection()
    for (const tableName of await queryClient.getAllTables(['public'])) {
      if (!tableName.includes('adonis')) {
        await queryClient.truncate(tableName)
      }
    }
  }

  let dateProvider = new StubDateProvider()

  const waitForConfirmation = async () => setTimeout(2000)

  group.setup(() => {
    app.container.swap(DateProvider, () => dateProvider)
    return () => {
      app.container.restore(DateProvider)
    }
  })

  group.each.setup(async () => {
    await clearDatabase()
    await PgSqlRider.create(rider)
    await PgSqlDriver.create(driver)
  })

  test('books a trip (happy path)', async ({ client, assert }) => {
    dateProvider.setCurrentDateTime(currentDateTime)

    const response = await client.post('/trips').json({
      id: tripId,
      startLocation,
      endLocation,
    })

    response.assertStatus(201)

    await waitForConfirmation()

    const dbTrips = await PgSqlTrip.all()
    assert.deepEqual(
      dbTrips.map((dbTrip) => ({
        id: dbTrip.id,
        riderId: dbTrip.riderId,
        startLocation: dbTrip.startLocation,
        endLocation: dbTrip.endLocation,
        bookedOn: dbTrip.bookedOn,
        carCategory: dbTrip.carCategory,
        price: dbTrip.price,
        driverId: dbTrip.driverId,
        status: dbTrip.status,
      })),
      [
        {
          id: tripId,
          riderId: rider.id,
          startLocation,
          endLocation,
          carCategory: 'NORMAL',
          bookedOn: currentDateTime,
          price: 30.5,
          driverId: driver.id,
          status: 'CONFIRMED',
        },
      ]
    )
    const dbDrivers = await PgSqlDriver.all()
    assert.deepEqual(
      dbDrivers.map((dbDdriver) => ({
        id: dbDdriver.id,
        name: dbDdriver.name,
        carCategory: dbDdriver.carCategory,
        isAvailable: dbDdriver.isAvailable,
        location: dbDdriver.location,
        currentTripId: dbDdriver.currentTripId,
      })),
      [
        {
          ...driver,
          isAvailable: false,
          currentTripId: tripId,
        },
      ]
    )
  })
})
