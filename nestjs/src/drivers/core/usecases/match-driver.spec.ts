import { InMemoryDomainEventOutbox } from '../../../shared/gateways/repositories/inmemory-domain-event-outbox';
import { StubDateProvider } from '../../../shared/test-utils/providers/stub-date-provider';
import { StubIdProvider } from '../../../shared/test-utils/providers/stub-id-provider';
import { InMemoryDriverRepository } from '../../gateways/repositories/inmemory-driver-repository';
import { InMemoryDriverUnitOfWork } from '../../gateways/repositories/inmemory-driver-unit-of-work';
import { StubLocationDistanceGateway } from '../../test-utils/providers/stub-location-distance-gateway';
import { type DriverDomainEvent } from '../events/driver-domain-event';
import { Driver, type DriverSnapshot } from '../structures/driver';
import { MatchDriverUseCase } from './match-driver';

describe('Match driver use case', () => {
  const tripId = 'trip-id';
  const tripStartLocation = 'Start location';
  const tripEndLocation = 'End location';
  const tripCarCategory = 'NORMAL';
  const availableDriverLocation = 'Driver location';
  const availableDriverSnapshot: DriverSnapshot = {
    id: 'driver-id',
    name: 'John Doe',
    carCategory: 'NORMAL',
    isAvailable: true,
    location: availableDriverLocation,
    currentTripId: null,
  };
  const otherDriverSnapshot: DriverSnapshot = {
    id: 'other-driver-id',
    name: 'Jane Doe',
    carCategory: 'NORMAL',
    isAvailable: false,
    location: null,
    currentTripId: null,
  };

  let useCase: MatchDriverUseCase;
  let unitOfWork: InMemoryDriverUnitOfWork;
  let domainEventOutbox: InMemoryDomainEventOutbox<DriverDomainEvent>;
  let driverRepository: InMemoryDriverRepository;
  let locationDistanceGateway: StubLocationDistanceGateway;
  let idProvider: StubIdProvider;
  let dateProvider: StubDateProvider;
  beforeEach(() => {
    domainEventOutbox = new InMemoryDomainEventOutbox();
    driverRepository = new InMemoryDriverRepository([
      otherDriverSnapshot,
      availableDriverSnapshot,
    ]);
    unitOfWork = new InMemoryDriverUnitOfWork(
      domainEventOutbox,
      driverRepository,
    );
    locationDistanceGateway = new StubLocationDistanceGateway();
    locationDistanceGateway.setDistance(
      availableDriverLocation,
      tripStartLocation,
      0,
    );
    idProvider = new StubIdProvider();
    dateProvider = new StubDateProvider();
    useCase = new MatchDriverUseCase(
      unitOfWork,
      locationDistanceGateway,
      idProvider,
      dateProvider,
    );
  });

  describe('selects available driver', () => {
    it('affects trip to selected driver', async () => {
      await useCase.execute({
        tripId,
        startLocation: tripStartLocation,
        endLocation: tripEndLocation,
        carCategory: tripCarCategory,
      });

      expect(driverRepository.driverSnapshots).toEqual([
        otherDriverSnapshot,
        {
          ...availableDriverSnapshot,
          isAvailable: false,
          currentTripId: tripId,
        },
      ]);
    });

    it('raises driver matched event', async () => {
      const eventId = 'event-id';
      idProvider.setId(eventId);
      const eventDate = new Date('2020-12-01 22:19:47');
      dateProvider.setCurrentDateTime(eventDate);

      await useCase.execute({
        tripId,
        startLocation: tripStartLocation,
        endLocation: tripEndLocation,
        carCategory: tripCarCategory,
      });

      expect(domainEventOutbox.messages).toEqual([
        {
          event: {
            id: eventId,
            occurredAt: eventDate,
            type: 'DRIVER_MATCHED',
            data: {
              driverId: availableDriverSnapshot.id,
              tripId,
            },
          },
          status: 'PENDING',
        },
      ]);
    });
  });

  describe('persists driver and event in same transaction', () => {
    it('commits transaction on success', async () => {
      await useCase.execute({
        tripId,
        startLocation: tripStartLocation,
        endLocation: tripEndLocation,
        carCategory: tripCarCategory,
      });

      expect(unitOfWork.transactions).toEqual([{ status: 'COMMITTED' }]);
    });

    it('rolls back transaction on trip persistence failure', async () => {
      const error = new Error('Driver persistence failure');
      driverRepository.setTestErrorTrigger('update', error);

      await expect(() =>
        useCase.execute({
          tripId,
          startLocation: tripStartLocation,
          endLocation: tripEndLocation,
          carCategory: tripCarCategory,
        }),
      ).rejects.toThrow(error);

      expect(unitOfWork.transactions).toEqual([{ status: 'ROLLED_BACK' }]);
    });

    it('rolls back transaction on event persistence failure', async () => {
      const error = new Error('Event persistence failure');
      domainEventOutbox.setTestErrorTrigger('addEvents', error);

      await expect(() =>
        useCase.execute({
          tripId,
          startLocation: tripStartLocation,
          endLocation: tripEndLocation,
          carCategory: tripCarCategory,
        }),
      ).rejects.toThrow(error);

      expect(unitOfWork.transactions).toEqual([{ status: 'ROLLED_BACK' }]);
    });
  });

  describe('rejects driver too far', () => {
    beforeEach(() => {
      locationDistanceGateway.setDistance(
        availableDriverLocation,
        tripStartLocation,
        5.1,
      );
    });

    it('doesnt affect trip to driver', async () => {
      await useCase.execute({
        tripId,
        startLocation: tripStartLocation,
        endLocation: tripEndLocation,
        carCategory: tripCarCategory,
      });

      expect(driverRepository.driverSnapshots).toEqual([
        otherDriverSnapshot,
        availableDriverSnapshot,
      ]);
    });

    it('raises no driver available event', async () => {
      const eventId = 'event-id-bis';
      idProvider.setId(eventId);
      const eventDate = new Date('2020-12-15 22:19:47');
      dateProvider.setCurrentDateTime(eventDate);

      await useCase.execute({
        tripId,
        startLocation: tripStartLocation,
        endLocation: tripEndLocation,
        carCategory: tripCarCategory,
      });

      expect(domainEventOutbox.messages).toEqual([
        {
          event: {
            id: eventId,
            occurredAt: eventDate,
            type: 'NO_DRIVER_AVAILABLE',
            data: { tripId },
          },
          status: 'PENDING',
        },
      ]);
    });
  });

  describe('handles UBERX car category', () => {
    const driverSnapshot = { ...availableDriverSnapshot };
    const initDriverRepository = async (
      carCategory: DriverSnapshot['carCategory'],
    ) => {
      driverSnapshot.carCategory = carCategory;
      await driverRepository.update(Driver.fromSnapshot(driverSnapshot));
    };

    it('selects available driver with same car category', async () => {
      initDriverRepository('UBERX');

      await useCase.execute({
        tripId,
        startLocation: tripStartLocation,
        endLocation: tripEndLocation,
        carCategory: 'UBERX',
      });

      expect(driverRepository.driverSnapshots).toEqual([
        otherDriverSnapshot,
        {
          ...driverSnapshot,
          isAvailable: false,
          currentTripId: tripId,
        },
      ]);
    });

    it('rejects available driver with different car category', async () => {
      initDriverRepository('NORMAL');

      await useCase.execute({
        tripId,
        startLocation: tripStartLocation,
        endLocation: tripEndLocation,
        carCategory: 'UBERX',
      });

      expect(driverRepository.driverSnapshots).toEqual([
        otherDriverSnapshot,
        driverSnapshot,
      ]);
    });
  });
});
