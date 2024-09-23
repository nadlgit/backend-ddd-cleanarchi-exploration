import { test } from '@japa/runner'
import { InMemoryDomainEventOutbox } from '#shared/gateways/repositories/inmemory-domain-event-outbox'
import { MockPublisher } from '#shared/test-utils/providers/mock-publisher'
import { InMemoryRiderRepository } from '#trips/gateways/repositories/inmemory-rider-repository'
import { InMemoryTripRepository } from '#trips/gateways/repositories/inmemory-trip-repository'
import { InMemoryTripUnitOfWork } from '#trips/gateways/repositories/inmemory-trip-unit-of-work'
import { type TripBooked } from '#trips/core/events/trip-booked'
import { type TripDomainEvent } from '#trips/core/events/trip-domain-event'
import { TripBookedListener } from '#trips/core/listeners/trip-booked-listener'
import { type TripSnapshot } from '#trips/core/structures/trip'

test.group('Publish trip booked external event', (group) => {
  const tripSnapshot: TripSnapshot = {
    id: 'trip-id',
    riderId: 'rider-id',
    startLocation: 'Start location',
    endLocation: 'End location',
    bookedOn: new Date('2020-12-01 22:19:47'),
    carCategory: 'NORMAL',
    price: 5,
    driverId: null,
    status: 'BOOKED',
  }
  const domainEvent: TripBooked = {
    id: 'event-id',
    occurredAt: tripSnapshot.bookedOn,
    type: 'TRIP_BOOKED',
    data: { tripId: tripSnapshot.id },
  }

  let listener: TripBookedListener
  let publisher: MockPublisher
  let unitOfWork: InMemoryTripUnitOfWork
  group.each.setup(() => {
    publisher = new MockPublisher()
    unitOfWork = new InMemoryTripUnitOfWork(
      new InMemoryDomainEventOutbox<TripDomainEvent>(),
      new InMemoryTripRepository([tripSnapshot]),
      new InMemoryRiderRepository()
    )
    listener = new TripBookedListener(publisher, unitOfWork)
  })

  test('publishes external event based on received domain event', async ({ expect }) => {
    await listener.publishExternalTripBookedEvent(domainEvent)
    expect(publisher.calls).toEqual([
      [
        {
          id: domainEvent.id,
          occurredAt: domainEvent.occurredAt,
          type: 'EXT_TRIP_BOOKED',
          data: {
            tripId: tripSnapshot.id,
            startLocation: tripSnapshot.startLocation,
            endLocation: tripSnapshot.endLocation,
            carCategory: tripSnapshot.carCategory,
          },
        },
      ],
    ])
  })
})
