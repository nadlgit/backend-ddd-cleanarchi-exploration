import { test } from '@japa/runner'
import { ExternalTripBookedListener } from '#drivers/core/listeners/ext-trip-booked-listener'
import { MatchDriverUseCase } from '#drivers/core/usecases/match-driver'
import { InMemoryDriverRepository } from '#drivers/gateways/repositories/inmemory-driver-repository'
import { InMemoryDriverUnitOfWork } from '#drivers/gateways/repositories/inmemory-driver-unit-of-work'
import { StubLocationDistanceGateway } from '#drivers/test-utils/providers/stub-location-distance-gateway'
import { type ExternalTripBooked } from '#shared/core/events/external-trip-booked'
import { InMemoryDomainEventOutbox } from '#shared/gateways/repositories/inmemory-domain-event-outbox'
import { StubIdProvider } from '#shared/test-utils/providers/stub-id-provider'
import { StubDateProvider } from '#shared/test-utils/providers/stub-date-provider'

class MockMatchDriverUseCase extends MatchDriverUseCase {
  readonly calls: any[] = []

  async execute(...params: any) {
    this.calls.push(params)
  }
}

test.group('Execute match driver use case', (group) => {
  const domainEvent: ExternalTripBooked = {
    id: 'event-id',
    occurredAt: new Date('2020-12-01 22:19:47'),
    type: 'EXT_TRIP_BOOKED',
    data: {
      tripId: 'trip-id',
      startLocation: 'Start location',
      endLocation: 'End location',
      carCategory: 'NORMAL',
    },
  }

  let listener: ExternalTripBookedListener
  let useCase: MockMatchDriverUseCase
  group.each.setup(() => {
    useCase = new MockMatchDriverUseCase(
      new InMemoryDriverUnitOfWork(new InMemoryDomainEventOutbox(), new InMemoryDriverRepository()),
      new StubLocationDistanceGateway(),
      new StubIdProvider(),
      new StubDateProvider()
    )
    listener = new ExternalTripBookedListener(useCase)
  })

  test('executes use case', async ({ expect }) => {
    await listener.matchDriver(domainEvent)
    expect(useCase.calls).toEqual([
      [
        {
          tripId: domainEvent.data.tripId,
          startLocation: domainEvent.data.startLocation,
          endLocation: domainEvent.data.endLocation,
          carCategory: domainEvent.data.carCategory,
        },
      ],
    ])
  })
})
