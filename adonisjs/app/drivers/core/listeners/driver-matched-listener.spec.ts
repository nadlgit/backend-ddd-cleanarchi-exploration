import { test } from '@japa/runner'
import { type DriverMatched } from '#drivers/core/events/driver-matched'
import { DriverMatchedListener } from '#drivers/core/listeners/driver-matched-listener'
import { MockPublisher } from '#shared/test-utils/providers/mock-publisher'

test.group('Publish driver matched external event', (group) => {
  const domainEvent: DriverMatched = {
    id: 'event-id',
    occurredAt: new Date('2020-12-01 22:19:47'),
    type: 'DRIVER_MATCHED',
    data: { driverId: 'driver-id', tripId: 'trip-id' },
  }

  let listener: DriverMatchedListener
  let publisher: MockPublisher
  group.each.setup(() => {
    publisher = new MockPublisher()
    listener = new DriverMatchedListener(publisher)
  })

  test('publishes external event based on received domain event', async ({ expect }) => {
    await listener.publishExternalDriverMatchedEvent(domainEvent)
    expect(publisher.calls).toEqual([
      [
        {
          id: domainEvent.id,
          occurredAt: domainEvent.occurredAt,
          type: 'EXT_DRIVER_MATCHED',
          data: {
            driverId: domainEvent.data.driverId,
            tripId: domainEvent.data.tripId,
          },
        },
      ],
    ])
  })
})
