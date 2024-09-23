import { InMemoryDomainEventOutbox } from '../../../shared/gateways/repositories/inmemory-domain-event-outbox';
import { StubDateProvider } from '../../../shared/test-utils/providers/stub-date-provider';
import { StubIdProvider } from '../../../shared/test-utils/providers/stub-id-provider';
import { InMemoryRiderRepository } from '../../gateways/repositories/inmemory-rider-repository';
import { InMemoryTripRepository } from '../../gateways/repositories/inmemory-trip-repository';
import { InMemoryTripUnitOfWork } from '../../gateways/repositories/inmemory-trip-unit-of-work';
import { type TripDomainEvent } from '../events/trip-domain-event';
import { type TripSnapshot } from '../structures/trip';
import { ConfirmTripUseCase } from './confirm-trip';

describe('Confirm trip use case', () => {
  const tripSnapshot: TripSnapshot = {
    id: 'b6a53eb6-8368-46b0-8111-c85bcc9f2cc9',
    riderId: 'f1c47471-bbc8-47d4-a158-a5a247a661ac',
    startLocation: 'Start location',
    endLocation: 'End location',
    bookedOn: new Date('2020-12-01 22:19:47'),
    carCategory: 'NORMAL',
    price: 5,
    driverId: null,
    status: 'BOOKED',
  };
  const driverId = '7471f1c4-bbc8-47d4-a158-a661aca5a247';

  let useCase: ConfirmTripUseCase;
  let unitOfWork: InMemoryTripUnitOfWork;
  let domainEventOutbox: InMemoryDomainEventOutbox<TripDomainEvent>;
  let tripRepository: InMemoryTripRepository;
  let idProvider: StubIdProvider;
  let dateProvider: StubDateProvider;
  beforeEach(() => {
    domainEventOutbox = new InMemoryDomainEventOutbox();
    tripRepository = new InMemoryTripRepository([tripSnapshot]);
    unitOfWork = new InMemoryTripUnitOfWork(
      domainEventOutbox,
      tripRepository,
      new InMemoryRiderRepository(),
    );
    idProvider = new StubIdProvider();
    dateProvider = new StubDateProvider();
    dateProvider.setCurrentDateTime(tripSnapshot.bookedOn);
    useCase = new ConfirmTripUseCase(unitOfWork, idProvider, dateProvider);
  });

  describe('confirms trip', () => {
    it('updates trip', async () => {
      await useCase.execute({
        id: tripSnapshot.id,
        driverId,
      });

      expect(tripRepository.tripSnapshots).toEqual([
        {
          ...tripSnapshot,
          driverId,
          status: 'CONFIRMED',
        },
      ]);
    });

    it('raises trip confirmed event', async () => {
      const eventId = 'a6693bf1-965a-4201-825c-b8f28307f08c';
      idProvider.setId(eventId);

      await useCase.execute({
        id: tripSnapshot.id,
        driverId,
      });

      expect(domainEventOutbox.messages).toEqual([
        {
          event: {
            id: eventId,
            occurredAt: tripSnapshot.bookedOn,
            type: 'TRIP_CONFIRMED',
            data: { tripId: tripSnapshot.id },
          },
          status: 'PENDING',
        },
      ]);
    });
  });

  describe('persists trip and event in same transaction', () => {
    it('commits transaction on success', async () => {
      await useCase.execute({
        id: tripSnapshot.id,
        driverId,
      });

      expect(unitOfWork.transactions).toEqual([{ status: 'COMMITTED' }]);
    });

    it('rolls back transaction on trip persistence failure', async () => {
      const error = new Error('Trip persistence failure');
      tripRepository.setTestErrorTrigger('update', error);

      await expect(() =>
        useCase.execute({
          id: tripSnapshot.id,
          driverId,
        }),
      ).rejects.toThrow(error);

      expect(unitOfWork.transactions).toEqual([{ status: 'ROLLED_BACK' }]);
    });

    it('rolls back transaction on event persistence failure', async () => {
      const error = new Error('Event persistence failure');
      domainEventOutbox.setTestErrorTrigger('addEvents', error);

      await expect(() =>
        useCase.execute({
          id: tripSnapshot.id,
          driverId,
        }),
      ).rejects.toThrow(error);

      expect(unitOfWork.transactions).toEqual([{ status: 'ROLLED_BACK' }]);
    });
  });
});
