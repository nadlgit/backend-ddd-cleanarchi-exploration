import { type TripUnitOfWork } from '#trips/core/ports/repositories/trip-unit-of-work'
import { type DateProvider } from '#shared/core/ports/providers/date-provider'
import { type IdProvider } from '#shared/core/ports/providers/id-provider'

type ConfirmTripCommand = {
  id: string
  driverId: string
}

export class ConfirmTripUseCase {
  constructor(
    private readonly unitOfWork: TripUnitOfWork,
    private readonly idProvider: IdProvider,
    private readonly dateProvider: DateProvider
  ) {}

  async execute({ id, driverId }: ConfirmTripCommand) {
    const trip = await this.unitOfWork.execute(async ({ tripRepository }) =>
      tripRepository.findById(id)
    )
    if (!trip) {
      throw new Error('Trip not found')
    }
    trip.confirm({
      driverId,
      idProvider: this.idProvider,
      dateProvider: this.dateProvider,
    })
    await this.unitOfWork.executeInTransaction(async ({ tripRepository, domainEventOutbox }) => {
      await tripRepository.update(trip)
      await domainEventOutbox.addEvents(trip.getEvents())
      trip.clearEvents() // NB: needed but dont know how to test it
    })
  }
}
