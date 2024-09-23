import { format, setYear, subDays, subMinutes } from 'date-fns';
import { InMemoryDomainEventOutbox } from '../../../shared/gateways/repositories/inmemory-domain-event-outbox';
import { StubDateProvider } from '../../../shared/test-utils/providers/stub-date-provider';
import { StubIdProvider } from '../../../shared/test-utils/providers/stub-id-provider';
import { InMemoryRiderRepository } from '../../gateways/repositories/inmemory-rider-repository';
import { InMemoryTripRepository } from '../../gateways/repositories/inmemory-trip-repository';
import { InMemoryTripUnitOfWork } from '../../gateways/repositories/inmemory-trip-unit-of-work';
import { StubTripScannerGateway } from '../../test-utils/providers/stub-trip-scanner-gateway';
import { type TripDomainEvent } from '../events/trip-domain-event';
import { DailyTripLimitReachedException } from '../exceptions/daily-trip-limit-reached-exception';
import { TripInProgressException } from '../exceptions/trip-inprogress-exception';
import { UberXShortTripException } from '../exceptions/uberx-short-trip-exception';
import { Rider, type RiderSnapshot } from '../structures/rider';
import { Trip, type TripSnapshot } from '../structures/trip';
import { BookTripUseCase } from './book-trip';

describe('Book trip use case', () => {
  const tripId = 'b6a53eb6-8368-46b0-8111-c85bcc9f2cc9';
  const riderId = 'f1c47471-bbc8-47d4-a158-a5a247a661ac';
  const riderSnapshot: RiderSnapshot = {
    id: riderId,
    birthDate: '2000-01-01',
    plan: 'BASIC',
  };
  const bookedOn = new Date('2020-12-01 22:19:47');
  const locationParis1 = 'Location, Paris';
  const locationParis2 = 'Other Location, Paris';
  const locationOutside1 = 'Location, Cergy';
  const locationOutside2 = 'Location, Sceaux';

  let useCase: BookTripUseCase;
  let unitOfWork: InMemoryTripUnitOfWork;
  let domainEventOutbox: InMemoryDomainEventOutbox<TripDomainEvent>;
  let tripRepository: InMemoryTripRepository;
  let riderRepository: InMemoryRiderRepository;
  let tripScannerGateway: StubTripScannerGateway;
  let idProvider: StubIdProvider;
  let dateProvider: StubDateProvider;
  beforeEach(() => {
    domainEventOutbox = new InMemoryDomainEventOutbox();
    tripRepository = new InMemoryTripRepository();
    riderRepository = new InMemoryRiderRepository([riderSnapshot]);
    unitOfWork = new InMemoryTripUnitOfWork(
      domainEventOutbox,
      tripRepository,
      riderRepository,
    );
    tripScannerGateway = new StubTripScannerGateway();
    tripScannerGateway.setTripZone(locationParis1, 'PARIS');
    tripScannerGateway.setTripZone(locationParis2, 'PARIS');
    tripScannerGateway.setTripZone(locationOutside1, 'OUTSIDE');
    tripScannerGateway.setTripZone(locationOutside2, 'OUTSIDE');
    idProvider = new StubIdProvider();
    dateProvider = new StubDateProvider();
    dateProvider.setCurrentDateTime(bookedOn);
    useCase = new BookTripUseCase(
      unitOfWork,
      tripScannerGateway,
      idProvider,
      dateProvider,
    );
  });

  describe('applies zone-based fees', () => {
    it.each([
      ['Paris to Outside', locationParis1, locationOutside1, 20],
      ['Outside to Paris', locationOutside1, locationParis1, 50],
      ['Outside to Outside', locationOutside1, locationOutside2, 100],
      ['Paris to Paris', locationParis1, locationParis2, 30],
    ])('%s', async (_, startLocation, endLocation, expectedPrice) => {
      await useCase.execute({
        id: tripId,
        riderId,
        startLocation,
        endLocation,
      });

      expect(tripRepository.tripSnapshots).toEqual([
        {
          id: tripId,
          riderId,
          startLocation,
          endLocation,
          bookedOn,
          carCategory: 'NORMAL',
          price: expectedPrice,
          driverId: null,
          status: 'BOOKED',
        },
      ]);
    });
  });

  describe('applies distance-based fees', () => {
    it.each([
      [1, 0.5],
      [2, 1],
      [0.2, 0.5],
    ])('%d km', async (distance, expectedFees) => {
      const startLocation = locationParis1;
      const endLocation = locationParis2;
      tripScannerGateway.setDistance(startLocation, endLocation, distance);

      await useCase.execute({
        id: tripId,
        riderId,
        startLocation,
        endLocation,
      });

      expect(tripRepository.tripSnapshots).toEqual([
        {
          id: tripId,
          riderId,
          startLocation,
          endLocation,
          bookedOn,
          carCategory: 'NORMAL',
          price: 30 + expectedFees,
          driverId: null,
          status: 'BOOKED',
        },
      ]);
    });
  });

  it('raises trip booked event', async () => {
    const eventId = 'a6693bf1-965a-4201-825c-b8f28307f08c';
    idProvider.setId(eventId);
    const startLocation = locationParis1;
    const endLocation = locationParis2;

    await useCase.execute({
      id: tripId,
      riderId,
      startLocation,
      endLocation,
    });

    expect(domainEventOutbox.messages).toEqual([
      {
        event: {
          id: eventId,
          occurredAt: bookedOn,
          type: 'TRIP_BOOKED',
          data: { tripId },
        },
        status: 'PENDING',
      },
    ]);
  });

  describe('persists trip and event in same transaction', () => {
    it('commits transaction on success', async () => {
      await useCase.execute({
        id: tripId,
        riderId,
        startLocation: locationParis1,
        endLocation: locationParis2,
      });

      expect(unitOfWork.transactions).toEqual([{ status: 'COMMITTED' }]);
    });

    it('rolls back transaction on trip persistence failure', async () => {
      const error = new Error('Trip persistence failure');
      tripRepository.setTestErrorTrigger('insert', error);

      await expect(() =>
        useCase.execute({
          id: tripId,
          riderId,
          startLocation: locationParis1,
          endLocation: locationParis2,
        }),
      ).rejects.toThrow(error);

      expect(unitOfWork.transactions).toEqual([{ status: 'ROLLED_BACK' }]);
    });

    it('rolls back transaction on event persistence failure', async () => {
      const error = new Error('Event persistence failure');
      domainEventOutbox.setTestErrorTrigger('addEvents', error);

      await expect(() =>
        useCase.execute({
          id: tripId,
          riderId,
          startLocation: locationParis1,
          endLocation: locationParis2,
        }),
      ).rejects.toThrow(error);

      expect(unitOfWork.transactions).toEqual([{ status: 'ROLLED_BACK' }]);
    });
  });

  describe('rejects booking given existing trip in progress', () => {
    const startLocation = locationParis1;
    const endLocation = locationParis2;
    const initTripRepository = async (
      status: TripSnapshot['status'],
      driverId: TripSnapshot['driverId'],
    ) => {
      await tripRepository.insert(
        Trip.fromSnapshot({
          id: '11113eb6-8368-46b0-8111-c85bcc9f2cc9',
          riderId,
          startLocation: locationParis1,
          endLocation: locationParis2,
          bookedOn: new Date('2020-12-01 22:19:47'),
          carCategory: 'NORMAL',
          price: 5,
          driverId,
          status,
        }),
      );
    };

    it.each<[TripSnapshot['status'], TripSnapshot['driverId']]>([
      ['BOOKED', null],
      ['CONFIRMED', '7471f1c4-bbc8-47d4-a158-a661aca5a247'],
    ])('status %s', async (status, driverId) => {
      await initTripRepository(status, driverId);
      const initialTrips = structuredClone(tripRepository.tripSnapshots);

      await expect(() =>
        useCase.execute({
          id: tripId,
          riderId,
          startLocation,
          endLocation,
        }),
      ).rejects.toThrow(TripInProgressException);

      expect(tripRepository.tripSnapshots).toEqual(initialTrips);
    });
  });

  describe.each<[RiderSnapshot['plan'], number]>([
    ['BASIC', 2],
    ['PREMIUM', 4],
  ])('handles %s plan daily trip limit', (riderPlan, dailyLimit) => {
    const startLocation = locationParis1;
    const endLocation = locationParis2;
    const currentDateTime = new Date('2020-12-01 23:58:00');
    const initTripRepository = async (sameDay: boolean) => {
      for (let i = 1; i <= dailyLimit; i++) {
        await tripRepository.insert(
          Trip.fromSnapshot({
            id: '11113eb6-8368-46b0-8111-' + i.toString().padStart(12, '0'),
            riderId,
            startLocation: locationParis1,
            endLocation: locationParis2,
            bookedOn: subMinutes(
              sameDay ? currentDateTime : subDays(currentDateTime, 1),
              i,
            ),
            carCategory: 'NORMAL',
            price: 5,
            driverId: '7471f1c4-bbc8-47d4-a158-a661aca5a247',
            status: 'TERMINATED',
          }),
        );
      }
    };

    beforeEach(async () => {
      await riderRepository.update(
        Rider.fromSnapshot({
          ...riderSnapshot,
          plan: riderPlan,
        }),
      );
      dateProvider.setCurrentDateTime(currentDateTime);
    });

    it('rejects booking given limit reached on same day', async () => {
      await initTripRepository(true);
      const initialTrips = structuredClone(tripRepository.tripSnapshots);

      await expect(() =>
        useCase.execute({
          id: tripId,
          riderId,
          startLocation,
          endLocation,
        }),
      ).rejects.toThrow(DailyTripLimitReachedException);

      expect(tripRepository.tripSnapshots).toEqual(initialTrips);
    });

    it('accepts booking given limit reached on different day', async () => {
      await initTripRepository(false);
      const initialTrips = structuredClone(tripRepository.tripSnapshots);

      await useCase.execute({
        id: tripId,
        riderId,
        startLocation,
        endLocation,
      });

      expect(tripRepository.tripSnapshots).toEqual([
        ...initialTrips,
        {
          id: tripId,
          riderId,
          startLocation,
          endLocation,
          bookedOn: currentDateTime,
          carCategory: 'NORMAL',
          price: 30,
          driverId: null,
          status: 'BOOKED',
        },
      ]);
    });
  });

  describe('handles UberX option', () => {
    const startLocation = locationParis1;
    const endLocation = locationParis2;
    const distance = 3;
    const priceWithoutFees = 31.5;

    beforeEach(() => {
      tripScannerGateway.setDistance(startLocation, endLocation, distance);
    });

    it('applies option fees given minimum trip distance and no discount', async () => {
      await useCase.execute({
        id: tripId,
        riderId,
        startLocation,
        endLocation,
        carCategory: 'UBERX',
      });

      expect(tripRepository.tripSnapshots).toEqual([
        {
          id: tripId,
          riderId,
          startLocation,
          endLocation,
          bookedOn,
          carCategory: 'UBERX',
          price: priceWithoutFees + 10,
          driverId: null,
          status: 'BOOKED',
        },
      ]);
    });

    it('rejects booking given trip too short', async () => {
      tripScannerGateway.setDistance(startLocation, endLocation, 2.5);

      await expect(() =>
        useCase.execute({
          id: tripId,
          riderId,
          startLocation,
          endLocation,
          carCategory: 'UBERX',
        }),
      ).rejects.toThrow(UberXShortTripException);

      expect(tripRepository.tripSnapshots).toEqual([]);
    });

    it('offers option fees on rider birthday', async () => {
      await riderRepository.update(
        Rider.fromSnapshot({
          ...riderSnapshot,
          birthDate: format(setYear(bookedOn, 1999), 'yyyy-MM-dd'),
        }),
      );

      await useCase.execute({
        id: tripId,
        riderId,
        startLocation,
        endLocation,
        carCategory: 'UBERX',
      });

      expect(tripRepository.tripSnapshots).toEqual([
        {
          id: tripId,
          riderId,
          startLocation,
          endLocation,
          bookedOn,
          carCategory: 'UBERX',
          price: priceWithoutFees,
          driverId: null,
          status: 'BOOKED',
        },
      ]);
    });
  });
});
