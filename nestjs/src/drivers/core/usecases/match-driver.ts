import { type DateProvider } from '../../../shared/core/ports/providers/date-provider';
import { type IdProvider } from '../../../shared/core/ports/providers/id-provider';
import { type CarCategory } from '../../../shared/core/structures/car-category';
import { NoDriverAvailable } from '../events/no-driver-available';
import { type LocationDistanceGateway } from '../ports/providers/location-distance-gateway';
import { type DriverUnitOfWork } from '../ports/repositories/driver-unit-of-work';

type MatchDriverCommand = {
  tripId: string;
  startLocation: string;
  endLocation: string;
  carCategory: CarCategory;
};

export class MatchDriverUseCase {
  constructor(
    private readonly unitOfWork: DriverUnitOfWork,
    private readonly locationDistanceGateway: LocationDistanceGateway,
    private readonly idProvider: IdProvider,
    private readonly dateProvider: DateProvider,
  ) {}

  async execute({ tripId, startLocation, carCategory }: MatchDriverCommand) {
    const driver = await this.findAvailableDriver(startLocation, carCategory);
    if (!driver) {
      await this.unitOfWork.execute(async ({ domainEventOutbox }) =>
        domainEventOutbox.addEvents([
          new NoDriverAvailable({
            id: this.idProvider.generate(),
            occurredAt: this.dateProvider.currentDateTime(),
            data: { tripId },
          }),
        ]),
      );
      return;
    }

    driver.acceptBookedTrip({
      tripId,
      idProvider: this.idProvider,
      dateProvider: this.dateProvider,
    });
    await this.unitOfWork.executeInTransaction(
      async ({ driverRepository, domainEventOutbox }) => {
        await driverRepository.update(driver);
        await domainEventOutbox.addEvents(driver.getEvents());
        driver.clearEvents(); // NB: needed but dont know how to test it
      },
    );
  }

  private async findAvailableDriver(
    tripStartLocation: string,
    carCategory: CarCategory,
  ) {
    const availableDrivers = await this.unitOfWork.execute(
      async ({ driverRepository }) => driverRepository.findAvailableDrivers(),
    );
    for (const driver of availableDrivers) {
      if (
        await driver.isBookedTripEligible({
          tripStartLocation,
          locationDistanceGateway: this.locationDistanceGateway,
          carCategory,
        })
      ) {
        return driver;
      }
    }
  }
}
