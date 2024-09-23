import { type AppEventListener } from '../../../shared/core/events/app-event-listener';
import { type ExternalDriverMatched } from '../../../shared/core/events/external-driver-matched';
import { type ConfirmTripUseCase } from '../usecases/confirm-trip';

export class ExternalDriverMatchedListener
  implements AppEventListener<ExternalDriverMatched>
{
  public readonly eventType = 'EXT_DRIVER_MATCHED';
  public readonly eventHandlers = [
    // NB: arrow functions to ensure 'this' refers to class instance
    (event: ExternalDriverMatched) => this.confirmTrip(event),
  ];

  constructor(private readonly confirmTripUseCase: ConfirmTripUseCase) {}

  async confirmTrip({ data }: ExternalDriverMatched) {
    await this.confirmTripUseCase.execute({
      id: data.tripId,
      driverId: data.driverId,
    });
  }
}
