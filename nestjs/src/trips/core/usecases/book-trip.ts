import { startOfDay } from 'date-fns';
import { type DateProvider } from '../../../shared/core/ports/providers/date-provider';
import { type IdProvider } from '../../../shared/core/ports/providers/id-provider';
import { type CarCategory } from '../../../shared/core/structures/car-category';
import { TripInProgressException } from '../exceptions/trip-inprogress-exception';
import { DailyTripLimitReachedException } from '../exceptions/daily-trip-limit-reached-exception';
import { type TripScannerGateway } from '../ports/providers/trip-scanner-gateway';
import { type TripUnitOfWork } from '../ports/repositories/trip-unit-of-work';
import { type Rider } from '../structures/rider';
import { Trip } from '../structures/trip';

type BookTripCommand = {
  id: string;
  riderId: string;
  startLocation: string;
  endLocation: string;
  carCategory?: CarCategory;
};

export class BookTripUseCase {
  constructor(
    private readonly unitOfWork: TripUnitOfWork,
    private readonly tripScannerGateway: TripScannerGateway,
    private readonly idProvider: IdProvider,
    private readonly dateProvider: DateProvider,
  ) {}

  async execute({
    id,
    riderId,
    startLocation,
    endLocation,
    carCategory = 'NORMAL',
  }: BookTripCommand) {
    const { rider, hasRiderTripInProgress, riderTodayTripCount } =
      await this.retrieveRiderData(riderId);
    this.assertRiderCanBookTrip(
      rider,
      hasRiderTripInProgress,
      riderTodayTripCount,
    );

    const { startZone, endZone, distanceKm } =
      await this.tripScannerGateway.retrieveTripRouteInfo(
        startLocation,
        endLocation,
      );
    const trip = Trip.book({
      id,
      riderId,
      isRiderBirthday: rider.isBirthday(this.dateProvider.currentDateTime()),
      startLocation,
      endLocation,
      startZone,
      endZone,
      distanceKm,
      carCategory,
      idProvider: this.idProvider,
      dateProvider: this.dateProvider,
    });

    await this.unitOfWork.executeInTransaction(
      async ({ tripRepository, domainEventOutbox }) => {
        await tripRepository.insert(trip);
        await domainEventOutbox.addEvents(trip.getEvents());
        trip.clearEvents(); // NB: needed but dont know how to test it
      },
    );
  }

  private async retrieveRiderData(riderId: string) {
    const [rider, riderTripCountByStatus, riderTodayTripCount] =
      await this.unitOfWork.execute(
        async ({ riderRepository, tripRepository }) =>
          Promise.all([
            await riderRepository.findById(riderId),
            await tripRepository.getRiderTripCountByStatus(riderId),
            await tripRepository.getRiderTripCountSince(
              riderId,
              startOfDay(this.dateProvider.currentDateTime()),
            ),
          ]),
      );
    if (!rider) {
      throw new Error('Rider not found');
    }
    return {
      rider,
      hasRiderTripInProgress:
        !!riderTripCountByStatus['BOOKED'] ||
        !!riderTripCountByStatus['CONFIRMED'],
      riderTodayTripCount,
    };
  }

  private assertRiderCanBookTrip(
    rider: Rider,
    hasTripInProgress: boolean,
    dayTripCount: number,
  ) {
    if (hasTripInProgress) {
      throw new TripInProgressException();
    }
    if (!rider.isTripCountLessThanDailyLimit(dayTripCount)) {
      throw new DailyTripLimitReachedException();
    }
  }
}
