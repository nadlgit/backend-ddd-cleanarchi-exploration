import { type MatchDriverUseCase } from '#drivers/core/usecases/match-driver'
import { type AppEventListener } from '#shared/core/events/app-event-listener'
import { type ExternalTripBooked } from '#shared/core/events/external-trip-booked'

export class ExternalTripBookedListener implements AppEventListener<ExternalTripBooked> {
  public readonly eventType = 'EXT_TRIP_BOOKED'
  public readonly eventHandlers = [
    // NB: arrow functions to ensure 'this' refers to class instance
    (event: ExternalTripBooked) => this.matchDriver(event),
  ]

  constructor(private readonly matchDriverUseCase: MatchDriverUseCase) {}

  async matchDriver({ data }: ExternalTripBooked) {
    await this.matchDriverUseCase.execute({
      tripId: data.tripId,
      startLocation: data.startLocation,
      endLocation: data.endLocation,
      carCategory: data.carCategory,
    })
  }
}
