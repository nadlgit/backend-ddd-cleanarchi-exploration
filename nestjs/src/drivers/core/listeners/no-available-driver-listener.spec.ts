import { type EventPublisher } from '../../../shared/core/ports/providers/event-publisher';
import { type NoDriverAvailable } from '../events/no-driver-available';
import { NoDriverAvailableListener } from './no-available-driver-listener';

describe('Publish no available driver external event', () => {
  const domainEvent: NoDriverAvailable = {
    id: 'event-id',
    occurredAt: new Date('2020-12-01 22:19:47'),
    type: 'NO_DRIVER_AVAILABLE',
    data: { tripId: 'trip-id' },
  };

  let listener: NoDriverAvailableListener;
  let publisher: EventPublisher;
  beforeEach(() => {
    publisher = { publish: jest.fn() };
    listener = new NoDriverAvailableListener(publisher);
  });

  it('publishes external event based on received domain event', async () => {
    await listener.publishExternalNoDriverAvailableEvent(domainEvent);
    expect(publisher.publish).toHaveBeenCalledWith({
      id: domainEvent.id,
      occurredAt: domainEvent.occurredAt,
      type: 'EXT_NO_DRIVER_AVAILABLE',
      data: {
        tripId: domainEvent.data.tripId,
      },
    });
  });
});
