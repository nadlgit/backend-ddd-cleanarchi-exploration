import { test } from '@japa/runner'
import { type DriverDomainEvent } from '#drivers/core/events/driver-domain-event'
import { Driver, type DriverSnapshot } from '#drivers/core/structures/driver'
import { MatchDriverUseCase } from '#drivers/core/usecases/match-driver'
import { InMemoryDriverRepository } from '#drivers/gateways/repositories/inmemory-driver-repository'
import { InMemoryDriverUnitOfWork } from '#drivers/gateways/repositories/inmemory-driver-unit-of-work'
import { StubLocationDistanceGateway } from '#drivers/test-utils/providers/stub-location-distance-gateway'
import { InMemoryDomainEventOutbox } from '#shared/gateways/repositories/inmemory-domain-event-outbox'
import { StubDateProvider } from '#shared/test-utils/providers/stub-date-provider'
import { StubIdProvider } from '#shared/test-utils/providers/stub-id-provider'

test.group('Match driver use case', (group) => {
  const tripId = 'trip-id'
  const tripStartLocation = 'Start location'
  const tripEndLocation = 'End location'
  const tripCarCategory = 'NORMAL'
  const availableDriverLocation = 'Driver location'
  const availableDriverSnapshot: DriverSnapshot = {
    id: 'driver-id',
    name: 'John Doe',
    carCategory: 'NORMAL',
    isAvailable: true,
    location: availableDriverLocation,
    currentTripId: null,
  }
  const otherDriverSnapshot: DriverSnapshot = {
    id: 'other-driver-id',
    name: 'Jane Doe',
    carCategory: 'NORMAL',
    isAvailable: false,
    location: null,
    currentTripId: null,
  }

  let useCase: MatchDriverUseCase
  let unitOfWork: InMemoryDriverUnitOfWork
  let domainEventOutbox: InMemoryDomainEventOutbox<DriverDomainEvent>
  let driverRepository: InMemoryDriverRepository
  let locationDistanceGateway: StubLocationDistanceGateway
  let idProvider: StubIdProvider
  let dateProvider: StubDateProvider

  group.each.setup(() => {
    domainEventOutbox = new InMemoryDomainEventOutbox()
    driverRepository = new InMemoryDriverRepository([otherDriverSnapshot, availableDriverSnapshot])
    unitOfWork = new InMemoryDriverUnitOfWork(domainEventOutbox, driverRepository)
    locationDistanceGateway = new StubLocationDistanceGateway()
    locationDistanceGateway.setDistance(availableDriverLocation, tripStartLocation, 0)
    idProvider = new StubIdProvider()
    dateProvider = new StubDateProvider()
    useCase = new MatchDriverUseCase(unitOfWork, locationDistanceGateway, idProvider, dateProvider)
  })

  test('affects trip to selected available driver', async ({ expect }) => {
    await useCase.execute({
      tripId,
      startLocation: tripStartLocation,
      endLocation: tripEndLocation,
      carCategory: tripCarCategory,
    })

    expect(driverRepository.driverSnapshots).toEqual([
      otherDriverSnapshot,
      {
        ...availableDriverSnapshot,
        isAvailable: false,
        currentTripId: tripId,
      },
    ])
  })

  test('raises driver matched event', async ({ expect }) => {
    const eventId = 'event-id'
    idProvider.setId(eventId)
    const eventDate = new Date('2020-12-01 22:19:47')
    dateProvider.setCurrentDateTime(eventDate)

    await useCase.execute({
      tripId,
      startLocation: tripStartLocation,
      endLocation: tripEndLocation,
      carCategory: tripCarCategory,
    })

    expect(domainEventOutbox.messages).toEqual([
      {
        event: {
          id: eventId,
          occurredAt: eventDate,
          type: 'DRIVER_MATCHED',
          data: {
            driverId: availableDriverSnapshot.id,
            tripId,
          },
        },
        status: 'PENDING',
      },
    ])
  })

  test('persists trip and event in same transaction: commits transaction on success', async ({
    expect,
  }) => {
    await useCase.execute({
      tripId,
      startLocation: tripStartLocation,
      endLocation: tripEndLocation,
      carCategory: tripCarCategory,
    })

    expect(unitOfWork.transactions).toEqual([{ status: 'COMMITTED' }])
  })

  test('persists trip and event in same transaction: rolls back transaction on driver persistence failure', async ({
    expect,
  }) => {
    const error = new Error('Driver persistence failure')
    driverRepository.setTestErrorTrigger('update', error)

    await expect(() =>
      useCase.execute({
        tripId,
        startLocation: tripStartLocation,
        endLocation: tripEndLocation,
        carCategory: tripCarCategory,
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
        tripId,
        startLocation: tripStartLocation,
        endLocation: tripEndLocation,
        carCategory: tripCarCategory,
      })
    ).rejects.toThrow(error)

    expect(unitOfWork.transactions).toEqual([{ status: 'ROLLED_BACK' }])
  })

  test('doesnt affect trip to driver too far', async ({ expect }) => {
    locationDistanceGateway.setDistance(availableDriverLocation, tripStartLocation, 5.1)

    await useCase.execute({
      tripId,
      startLocation: tripStartLocation,
      endLocation: tripEndLocation,
      carCategory: tripCarCategory,
    })

    expect(driverRepository.driverSnapshots).toEqual([otherDriverSnapshot, availableDriverSnapshot])
  })

  test('raises no driver available event', async ({ expect }) => {
    locationDistanceGateway.setDistance(availableDriverLocation, tripStartLocation, 5.1)
    const eventId = 'event-id-bis'
    idProvider.setId(eventId)
    const eventDate = new Date('2020-12-15 22:19:47')
    dateProvider.setCurrentDateTime(eventDate)

    await useCase.execute({
      tripId,
      startLocation: tripStartLocation,
      endLocation: tripEndLocation,
      carCategory: tripCarCategory,
    })

    expect(domainEventOutbox.messages).toEqual([
      {
        event: {
          id: eventId,
          occurredAt: eventDate,
          type: 'NO_DRIVER_AVAILABLE',
          data: { tripId },
        },
        status: 'PENDING',
      },
    ])
  })

  test('given trip booked with UBERX car category: selects available driver with same car category', async ({
    expect,
  }) => {
    const driverSnapshot: DriverSnapshot = {
      ...availableDriverSnapshot,
      carCategory: 'UBERX',
    }
    await driverRepository.update(Driver.fromSnapshot(driverSnapshot))

    await useCase.execute({
      tripId,
      startLocation: tripStartLocation,
      endLocation: tripEndLocation,
      carCategory: 'UBERX',
    })

    expect(driverRepository.driverSnapshots).toEqual([
      otherDriverSnapshot,
      {
        ...driverSnapshot,
        isAvailable: false,
        currentTripId: tripId,
      },
    ])
  })

  test('given trip booked with UBERX car category: rejects available driver with different car category', async ({
    expect,
  }) => {
    const driverSnapshot: DriverSnapshot = {
      ...availableDriverSnapshot,
      carCategory: 'NORMAL',
    }
    await driverRepository.update(Driver.fromSnapshot(driverSnapshot))

    await useCase.execute({
      tripId,
      startLocation: tripStartLocation,
      endLocation: tripEndLocation,
      carCategory: 'UBERX',
    })

    expect(driverRepository.driverSnapshots).toEqual([otherDriverSnapshot, driverSnapshot])
  })
})
