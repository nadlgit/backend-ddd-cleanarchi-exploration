import { test } from '@japa/runner'
import { type ExternalDriverMatched } from '#shared/core/events/external-driver-matched'
import { InMemoryDomainEventOutbox } from '#shared/gateways/repositories/inmemory-domain-event-outbox'
import { StubIdProvider } from '#shared/test-utils/providers/stub-id-provider'
import { StubDateProvider } from '#shared/test-utils/providers/stub-date-provider'
import { ExternalDriverMatchedListener } from '#trips/core/listeners/ext-driver-matched-listener'
import { ConfirmTripUseCase } from '#trips/core/usecases/confirm-trip'
import { InMemoryRiderRepository } from '#trips/gateways/repositories/inmemory-rider-repository'
import { InMemoryTripRepository } from '#trips/gateways/repositories/inmemory-trip-repository'
import { InMemoryTripUnitOfWork } from '#trips/gateways/repositories/inmemory-trip-unit-of-work'

class MockConfirmTripUseCase extends ConfirmTripUseCase {
  readonly calls: any[] = []

  async execute(...params: any) {
    this.calls.push(params)
  }
}

test.group('Execute confirm trip use case', (group) => {
  const domainEvent: ExternalDriverMatched = {
    id: 'event-id',
    occurredAt: new Date('2020-12-01 22:19:47'),
    type: 'EXT_DRIVER_MATCHED',
    data: {
      driverId: 'driver-id',
      tripId: 'trip-id',
    },
  }

  let listener: ExternalDriverMatchedListener
  let useCase: MockConfirmTripUseCase
  group.each.setup(() => {
    useCase = new MockConfirmTripUseCase(
      new InMemoryTripUnitOfWork(
        new InMemoryDomainEventOutbox(),
        new InMemoryTripRepository(),
        new InMemoryRiderRepository()
      ),
      new StubIdProvider(),
      new StubDateProvider()
    )
    listener = new ExternalDriverMatchedListener(useCase)
  })

  test('executes use case', async ({ expect }) => {
    await listener.confirmTrip(domainEvent)
    expect(useCase.calls).toEqual([
      [
        {
          id: domainEvent.data.tripId,
          driverId: domainEvent.data.driverId,
        },
      ],
    ])
  })
})
