import { test } from '@japa/runner'
import { format, setYear, subDays, subMinutes } from 'date-fns'
import { InMemoryDomainEventOutbox } from '#shared/gateways/repositories/inmemory-domain-event-outbox'
import { StubDateProvider } from '#shared/test-utils/providers/stub-date-provider'
import { StubIdProvider } from '#shared/test-utils/providers/stub-id-provider'
import { type TripDomainEvent } from '#trips/core/events/trip-domain-event'
import { DailyTripLimitReachedException } from '#trips/core/exceptions/daily-trip-limit-reached-exception'
import { TripInProgressException } from '#trips/core/exceptions/trip-inprogress-exception'
import { UberXShortTripException } from '#trips/core/exceptions/uberx-short-trip-exception'
import { Rider, type RiderSnapshot } from '#trips/core/structures/rider'
import { Trip, type TripSnapshot } from '#trips/core/structures/trip'
import { BookTripUseCase } from '#trips/core/usecases/book-trip'
import { InMemoryRiderRepository } from '#trips/gateways/repositories/inmemory-rider-repository'
import { InMemoryTripRepository } from '#trips/gateways/repositories/inmemory-trip-repository'
import { InMemoryTripUnitOfWork } from '#trips/gateways/repositories/inmemory-trip-unit-of-work'
import { StubTripScannerGateway } from '#trips/test-utils/providers/stub-trip-scanner-gateway'

test.group('Book trip use case', (group) => {
  const tripId = 'b6a53eb6-8368-46b0-8111-c85bcc9f2cc9'
  const riderId = 'f1c47471-bbc8-47d4-a158-a5a247a661ac'
  const riderSnapshot: RiderSnapshot = {
    id: riderId,
    birthDate: '2000-01-01',
    plan: 'BASIC',
  }
  const dateTime = new Date('2020-12-01 22:19:47')
  const locationParis1 = 'Location, Paris'
  const locationParis2 = 'Other Location, Paris'
  const locationOutside1 = 'Location, Cergy'
  const locationOutside2 = 'Location, Sceaux'

  let useCase: BookTripUseCase
  let unitOfWork: InMemoryTripUnitOfWork
  let domainEventOutbox: InMemoryDomainEventOutbox<TripDomainEvent>
  let tripRepository: InMemoryTripRepository
  let riderRepository: InMemoryRiderRepository
  let tripScannerGateway: StubTripScannerGateway
  let idProvider: StubIdProvider
  let dateProvider: StubDateProvider

  group.each.setup(() => {
    domainEventOutbox = new InMemoryDomainEventOutbox()
    tripRepository = new InMemoryTripRepository()
    riderRepository = new InMemoryRiderRepository([riderSnapshot])
    unitOfWork = new InMemoryTripUnitOfWork(domainEventOutbox, tripRepository, riderRepository)
    tripScannerGateway = new StubTripScannerGateway()
    tripScannerGateway.setTripZone(locationParis1, 'PARIS')
    tripScannerGateway.setTripZone(locationParis2, 'PARIS')
    tripScannerGateway.setTripZone(locationOutside1, 'OUTSIDE')
    tripScannerGateway.setTripZone(locationOutside2, 'OUTSIDE')
    idProvider = new StubIdProvider()
    dateProvider = new StubDateProvider()
    dateProvider.setCurrentDateTime(dateTime)
    useCase = new BookTripUseCase(unitOfWork, tripScannerGateway, idProvider, dateProvider)
  })

  const initTripRepository = async (trips: TripSnapshot[]) => {
    for (const trip of trips) {
      await tripRepository.insert(Trip.fromSnapshot(trip))
    }
  }

  test('applies zone-based fees: {case}')
    .with([
      {
        case: 'Paris to Outside',
        startLocation: locationParis1,
        endLocation: locationOutside1,
        expectedPrice: 20,
      },
      {
        case: 'Outside to Paris',
        startLocation: locationOutside1,
        endLocation: locationParis1,
        expectedPrice: 50,
      },
      {
        case: 'Outside to Outside',
        startLocation: locationOutside1,
        endLocation: locationOutside2,
        expectedPrice: 100,
      },
      {
        case: 'Paris to Paris',
        startLocation: locationParis1,
        endLocation: locationParis2,
        expectedPrice: 30,
      },
    ])
    .run(async ({ expect }, { startLocation, endLocation, expectedPrice }) => {
      await useCase.execute({
        id: tripId,
        riderId,
        startLocation,
        endLocation,
      })

      expect(tripRepository.tripSnapshots).toEqual([
        {
          id: tripId,
          riderId,
          startLocation,
          endLocation,
          bookedOn: dateTime,
          carCategory: 'NORMAL',
          price: expectedPrice,
          driverId: null,
          status: 'BOOKED',
        },
      ])
    })

  test('applies distance-based fees: {distance} km')
    .with([
      { distance: 1, expectedFees: 0.5 },
      { distance: 2, expectedFees: 1 },
      { distance: 0.2, expectedFees: 0.5 },
    ])
    .run(async ({ expect }, { distance, expectedFees }) => {
      const startLocation = locationParis1
      const endLocation = locationParis2
      tripScannerGateway.setDistance(startLocation, endLocation, distance)

      await useCase.execute({
        id: tripId,
        riderId,
        startLocation,
        endLocation,
      })

      expect(tripRepository.tripSnapshots).toEqual([
        {
          id: tripId,
          riderId,
          startLocation,
          endLocation,
          bookedOn: dateTime,
          carCategory: 'NORMAL',
          price: 30 + expectedFees,
          driverId: null,
          status: 'BOOKED',
        },
      ])
    })

  test('raises trip booked event', async ({ expect }) => {
    const eventId = 'a6693bf1-965a-4201-825c-b8f28307f08c'
    idProvider.setId(eventId)

    await useCase.execute({
      id: tripId,
      riderId,
      startLocation: locationParis1,
      endLocation: locationParis2,
    })

    expect(domainEventOutbox.messages).toEqual([
      {
        event: {
          id: eventId,
          occurredAt: dateTime,
          type: 'TRIP_BOOKED',
          data: { tripId },
        },
        status: 'PENDING',
      },
    ])
  })

  test('persists trip and event in same transaction: commits transaction on success', async ({
    expect,
  }) => {
    await useCase.execute({
      id: tripId,
      riderId,
      startLocation: locationParis1,
      endLocation: locationParis2,
    })

    expect(unitOfWork.transactions).toEqual([{ status: 'COMMITTED' }])
  })

  test('persists trip and event in same transaction: rolls back transaction on trip persistence failure', async ({
    expect,
  }) => {
    const error = new Error('Trip persistence failure')
    tripRepository.setTestErrorTrigger('insert', error)

    await expect(() =>
      useCase.execute({
        id: tripId,
        riderId,
        startLocation: locationParis1,
        endLocation: locationParis2,
      })
    ).rejects.toThrow(error)

    expect(unitOfWork.transactions).toEqual([{ status: 'ROLLED_BACK' }])
  })

  test('persists trip and event in same transaction: rolls back transaction on event persistence failure', async ({
    expect,
  }) => {
    const error = new Error('Event persistence failure')
    domainEventOutbox.setTestErrorTrigger('addEvents', error)

    await expect(() =>
      useCase.execute({
        id: tripId,
        riderId,
        startLocation: locationParis1,
        endLocation: locationParis2,
      })
    ).rejects.toThrow(error)

    expect(unitOfWork.transactions).toEqual([{ status: 'ROLLED_BACK' }])
  })

  test('rejects booking given existing trip in progress: status {status}')
    .with<{ status: TripSnapshot['status']; driverId: TripSnapshot['driverId'] }[]>([
      { status: 'BOOKED', driverId: null },
      { status: 'CONFIRMED', driverId: '7471f1c4-bbc8-47d4-a158-a661aca5a247' },
    ])
    .run(async ({ expect }, { status, driverId }) => {
      const startLocation = locationParis1
      const endLocation = locationParis2
      await initTripRepository([
        {
          id: '11113eb6-8368-46b0-8111-c85bcc9f2cc9',
          riderId,
          startLocation,
          endLocation,
          bookedOn: new Date('2020-12-01 22:19:47'),
          carCategory: 'NORMAL',
          price: 5,
          driverId,
          status: status,
        },
      ])
      const initialTrips = structuredClone(tripRepository.tripSnapshots)

      await expect(() =>
        useCase.execute({
          id: tripId,
          riderId,
          startLocation,
          endLocation,
        })
      ).rejects.toThrow(TripInProgressException)

      expect(tripRepository.tripSnapshots).toEqual(initialTrips)
    })

  test('rejects booking given {riderPlan} plan daily trip limit reached on same day')
    .with<{ riderPlan: RiderSnapshot['plan']; dailyLimit: number }[]>([
      { riderPlan: 'BASIC', dailyLimit: 2 },
      { riderPlan: 'PREMIUM', dailyLimit: 4 },
    ])
    .run(async ({ expect }, { riderPlan, dailyLimit }) => {
      const startLocation = locationParis1
      const endLocation = locationParis2
      const currentDateTime = new Date('2020-12-01 23:58:00')
      dateProvider.setCurrentDateTime(currentDateTime)
      await riderRepository.update(
        Rider.fromSnapshot({
          ...riderSnapshot,
          plan: riderPlan,
        })
      )
      await initTripRepository(
        Array.from(new Array(dailyLimit), (_, i) => i + 1).map((i) => ({
          id: '11113eb6-8368-46b0-8111-' + i.toString().padStart(12, '0'),
          riderId,
          startLocation,
          endLocation,
          bookedOn: subMinutes(currentDateTime, i),
          carCategory: 'NORMAL',
          price: 5,
          driverId: '7471f1c4-bbc8-47d4-a158-a661aca5a247',
          status: 'TERMINATED',
        }))
      )
      const initialTrips = structuredClone(tripRepository.tripSnapshots)

      await expect(() =>
        useCase.execute({
          id: tripId,
          riderId,
          startLocation,
          endLocation,
        })
      ).rejects.toThrow(DailyTripLimitReachedException)

      expect(tripRepository.tripSnapshots).toEqual(initialTrips)
    })

  test('accepts booking given {riderPlan} plan daily trip limit reached on different day')
    .with<{ riderPlan: RiderSnapshot['plan']; dailyLimit: number }[]>([
      { riderPlan: 'BASIC', dailyLimit: 2 },
      { riderPlan: 'PREMIUM', dailyLimit: 4 },
    ])
    .run(async ({ expect }, { riderPlan, dailyLimit }) => {
      const startLocation = locationParis1
      const endLocation = locationParis2
      const currentDateTime = new Date('2020-12-01 23:58:00')
      dateProvider.setCurrentDateTime(currentDateTime)
      await riderRepository.update(
        Rider.fromSnapshot({
          ...riderSnapshot,
          plan: riderPlan,
        })
      )
      await initTripRepository(
        Array.from(new Array(dailyLimit), (_, idx) => idx + 1).map((i) => ({
          id: '11113eb6-8368-46b0-8111-' + i.toString().padStart(12, '0'),
          riderId,
          startLocation,
          endLocation,
          bookedOn: subMinutes(subDays(currentDateTime, 1), i),
          carCategory: 'NORMAL',
          price: 5,
          driverId: '7471f1c4-bbc8-47d4-a158-a661aca5a247',
          status: 'TERMINATED',
        }))
      )
      const initialTrips = structuredClone(tripRepository.tripSnapshots)

      await useCase.execute({
        id: tripId,
        riderId,
        startLocation,
        endLocation,
      })

      expect(tripRepository.tripSnapshots).toEqual([
        ...initialTrips,
        {
          id: tripId,
          riderId,
          startLocation,
          endLocation,
          bookedOn: currentDateTime,
          carCategory: 'NORMAL',
          price: 30,
          driverId: null,
          status: 'BOOKED',
        },
      ])
    })

  test('applies UberX option fees given minimum trip distance and no discount', async ({
    expect,
  }) => {
    const startLocation = locationParis1
    const endLocation = locationParis2
    tripScannerGateway.setDistance(startLocation, endLocation, 3)
    const priceWithoutFees = 31.5

    await useCase.execute({
      id: tripId,
      riderId,
      startLocation,
      endLocation,
      carCategory: 'UBERX',
    })

    expect(tripRepository.tripSnapshots).toEqual([
      {
        id: tripId,
        riderId,
        startLocation,
        endLocation,
        bookedOn: dateTime,
        carCategory: 'UBERX',
        price: priceWithoutFees + 10,
        driverId: null,
        status: 'BOOKED',
      },
    ])
  })

  test('rejects booking with UberX option given trip too short', async ({ expect }) => {
    const startLocation = locationParis1
    const endLocation = locationParis2
    tripScannerGateway.setDistance(startLocation, endLocation, 2.5)

    await expect(() =>
      useCase.execute({
        id: tripId,
        riderId,
        startLocation,
        endLocation,
        carCategory: 'UBERX',
      })
    ).rejects.toThrow(UberXShortTripException)

    expect(tripRepository.tripSnapshots).toEqual([])
  })

  test('offers UberX option fees on rider birthday', async ({ expect }) => {
    const startLocation = locationParis1
    const endLocation = locationParis2
    tripScannerGateway.setDistance(startLocation, endLocation, 3)
    const priceWithoutFees = 31.5
    await riderRepository.update(
      Rider.fromSnapshot({
        ...riderSnapshot,
        birthDate: format(setYear(dateTime, 1999), 'yyyy-MM-dd'),
      })
    )

    await useCase.execute({
      id: tripId,
      riderId,
      startLocation,
      endLocation,
      carCategory: 'UBERX',
    })

    expect(tripRepository.tripSnapshots).toEqual([
      {
        id: tripId,
        riderId,
        startLocation,
        endLocation,
        bookedOn: dateTime,
        carCategory: 'UBERX',
        price: priceWithoutFees,
        driverId: null,
        status: 'BOOKED',
      },
    ])
  })
})
