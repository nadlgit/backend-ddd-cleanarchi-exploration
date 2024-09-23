import { type EventPublisher } from '../../../shared/core/ports/providers/event-publisher';
import { type DriverMatched } from '../events/driver-matched';
import { DriverMatchedListener } from './driver-matched-listener';

describe('Publish driver matched external event', () => {
  const domainEvent: DriverMatched = {
    id: 'event-id',
    occurredAt: new Date('2020-12-01 22:19:47'),
    type: 'DRIVER_MATCHED',
    data: { driverId: 'driver-id', tripId: 'trip-id' },
  };

  let listener: DriverMatchedListener;
  let publisher: EventPublisher;
  beforeEach(() => {
    publisher = { publish: jest.fn() };
    listener = new DriverMatchedListener(publisher);
  });

  it('publishes external event based on received domain event', async () => {
    await listener.publishExternalDriverMatchedEvent(domainEvent);
    expect(publisher.publish).toHaveBeenCalledWith({
      id: domainEvent.id,
      occurredAt: domainEvent.occurredAt,
      type: 'EXT_DRIVER_MATCHED',
      data: {
        driverId: domainEvent.data.driverId,
        tripId: domainEvent.data.tripId,
      },
    });
  });
});
