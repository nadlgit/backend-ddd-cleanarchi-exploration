import { type ExternalTripBooked } from '../../../shared/core/events/external-trip-booked';
import { InMemoryDomainEventOutbox } from '../../../shared/gateways/repositories/inmemory-domain-event-outbox';
import { StubIdProvider } from '../../../shared/test-utils/providers/stub-id-provider';
import { StubDateProvider } from '../../../shared/test-utils/providers/stub-date-provider';
import { InMemoryDriverRepository } from '../../gateways/repositories/inmemory-driver-repository';
import { InMemoryDriverUnitOfWork } from '../../gateways/repositories/inmemory-driver-unit-of-work';
import { StubLocationDistanceGateway } from '../../test-utils/providers/stub-location-distance-gateway';
import { MatchDriverUseCase } from '../usecases/match-driver';
import { ExternalTripBookedListener } from './ext-trip-booked-listener';

jest.mock('../usecases/match-driver');

describe('Execute match driver use case', () => {
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
  };

  let listener: ExternalTripBookedListener;
  let useCase: MatchDriverUseCase;
  beforeEach(() => {
    useCase = new MatchDriverUseCase(
      new InMemoryDriverUnitOfWork(
        new InMemoryDomainEventOutbox(),
        new InMemoryDriverRepository(),
      ),
      new StubLocationDistanceGateway(),
      new StubIdProvider(),
      new StubDateProvider(),
    );
    listener = new ExternalTripBookedListener(useCase);
  });

  it('executes use case', async () => {
    await listener.matchDriver(domainEvent);
    expect(useCase.execute).toHaveBeenCalledWith({
      tripId: domainEvent.data.tripId,
      startLocation: domainEvent.data.startLocation,
      endLocation: domainEvent.data.endLocation,
      carCategory: domainEvent.data.carCategory,
    });
  });
});
