import { type EventPublisher } from '../../../shared/core/ports/providers/event-publisher';
import { InMemoryDomainEventOutbox } from '../../../shared/gateways/repositories/inmemory-domain-event-outbox';
import { InMemoryRiderRepository } from '../../gateways/repositories/inmemory-rider-repository';
import { InMemoryTripRepository } from '../../gateways/repositories/inmemory-trip-repository';
import { InMemoryTripUnitOfWork } from '../../gateways/repositories/inmemory-trip-unit-of-work';
import { type TripBooked } from '../events/trip-booked';
import { type TripDomainEvent } from '../events/trip-domain-event';
import { type TripSnapshot } from '../structures/trip';
import { TripBookedListener } from './trip-booked-listener';

describe('Publish trip booked external event', () => {
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
  };
  const domainEvent: TripBooked = {
    id: 'event-id',
    occurredAt: tripSnapshot.bookedOn,
    type: 'TRIP_BOOKED',
    data: { tripId: tripSnapshot.id },
  };

  let listener: TripBookedListener;
  let publisher: EventPublisher;
  let unitOfWork: InMemoryTripUnitOfWork;
  beforeEach(() => {
    publisher = { publish: jest.fn() };
    unitOfWork = new InMemoryTripUnitOfWork(
      new InMemoryDomainEventOutbox<TripDomainEvent>(),
      new InMemoryTripRepository([tripSnapshot]),
      new InMemoryRiderRepository(),
    );
    listener = new TripBookedListener(publisher, unitOfWork);
  });

  it('publishes external event based on received domain event', async () => {
    await listener.publishExternalTripBookedEvent(domainEvent);
    expect(publisher.publish).toHaveBeenCalledWith({
      id: domainEvent.id,
      occurredAt: domainEvent.occurredAt,
      type: 'EXT_TRIP_BOOKED',
      data: {
        tripId: tripSnapshot.id,
        startLocation: tripSnapshot.startLocation,
        endLocation: tripSnapshot.endLocation,
        carCategory: tripSnapshot.carCategory,
      },
    });
  });
});
