import { test } from '@japa/runner'
import { type NoDriverAvailable } from '#drivers/core/events/no-driver-available'
import { NoDriverAvailableListener } from '#drivers/core/listeners/no-available-driver-listener'
import { MockPublisher } from '#shared/test-utils/providers/mock-publisher'

test.group('Publish no available driver external event', (group) => {
  const domainEvent: NoDriverAvailable = {
    id: 'event-id',
    occurredAt: new Date('2020-12-01 22:19:47'),
    type: 'NO_DRIVER_AVAILABLE',
    data: { tripId: 'trip-id' },
  }

  let listener: NoDriverAvailableListener
  let publisher: MockPublisher
  group.each.setup(() => {
    publisher = new MockPublisher()
    listener = new NoDriverAvailableListener(publisher)
  })

  test('publishes external event based on received domain event', async ({ expect }) => {
    await listener.publishExternalNoDriverAvailableEvent(domainEvent)
    expect(publisher.calls).toEqual([
      [
        {
          id: domainEvent.id,
          occurredAt: domainEvent.occurredAt,
          type: 'EXT_NO_DRIVER_AVAILABLE',
          data: {
            tripId: domainEvent.data.tripId,
          },
        },
      ],
    ])
  })
})
