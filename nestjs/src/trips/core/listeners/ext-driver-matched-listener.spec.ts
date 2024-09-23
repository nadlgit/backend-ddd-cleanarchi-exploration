import { type ExternalDriverMatched } from '../../../shared/core/events/external-driver-matched';
import { InMemoryDomainEventOutbox } from '../../../shared/gateways/repositories/inmemory-domain-event-outbox';
import { StubIdProvider } from '../../../shared/test-utils/providers/stub-id-provider';
import { StubDateProvider } from '../../../shared/test-utils/providers/stub-date-provider';
import { InMemoryRiderRepository } from '../../gateways/repositories/inmemory-rider-repository';
import { InMemoryTripRepository } from '../../gateways/repositories/inmemory-trip-repository';
import { InMemoryTripUnitOfWork } from '../../gateways/repositories/inmemory-trip-unit-of-work';
import { ConfirmTripUseCase } from '../usecases/confirm-trip';
import { ExternalDriverMatchedListener } from './ext-driver-matched-listener';

jest.mock('../usecases/confirm-trip');

describe('Execute confirm trip use case', () => {
  const domainEvent: ExternalDriverMatched = {
    id: 'event-id',
    occurredAt: new Date('2020-12-01 22:19:47'),
    type: 'EXT_DRIVER_MATCHED',
    data: {
      driverId: 'driver-id',
      tripId: 'trip-id',
    },
  };

  let listener: ExternalDriverMatchedListener;
  let useCase: ConfirmTripUseCase;
  beforeEach(() => {
    useCase = new ConfirmTripUseCase(
      new InMemoryTripUnitOfWork(
        new InMemoryDomainEventOutbox(),
        new InMemoryTripRepository(),
        new InMemoryRiderRepository(),
      ),
      new StubIdProvider(),
      new StubDateProvider(),
    );
    listener = new ExternalDriverMatchedListener(useCase);
  });

  it('executes use case', async () => {
    await listener.confirmTrip(domainEvent);
    expect(useCase.execute).toHaveBeenCalledWith({
      id: domainEvent.data.tripId,
      driverId: domainEvent.data.driverId,
    });
  });
});
