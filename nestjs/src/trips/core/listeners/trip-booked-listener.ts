import { type AppEventListener } from '../../../shared/core/events/app-event-listener';
import { ExternalTripBooked } from '../../../shared/core/events/external-trip-booked';
import { type EventPublisher } from '../../../shared/core/ports/providers/event-publisher';
import { type TripBooked } from '../events/trip-booked';
import { type TripUnitOfWork } from '../ports/repositories/trip-unit-of-work';

export class TripBookedListener implements AppEventListener<TripBooked> {
  public readonly eventType = 'TRIP_BOOKED';
  public readonly eventHandlers = [
    // NB: arrow functions to ensure 'this' refers to class instance
    (event: TripBooked) => this.publishExternalTripBookedEvent(event),
  ];

  constructor(
    private readonly eventPublisher: EventPublisher,
    private readonly unitOfWork: TripUnitOfWork,
  ) {}

  async publishExternalTripBookedEvent({ id, occurredAt, data }: TripBooked) {
    const trip = await this.unitOfWork.execute(async ({ tripRepository }) =>
      tripRepository.findById(data.tripId),
    );
    if (!trip) {
      throw new Error('Trip not found');
    }
    const {
      id: tripId,
      startLocation,
      endLocation,
      carCategory,
    } = trip.toSnapshot();
    await this.eventPublisher.publish(
      new ExternalTripBooked({
        id,
        occurredAt,
        data: { tripId, startLocation, endLocation, carCategory },
      }),
    );
  }
}
