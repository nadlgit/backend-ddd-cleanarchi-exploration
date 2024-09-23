import { type ExternalDriverMatched } from '../../../shared/core/events/external-driver-matched';
import { AppEventSubscription } from '../../../shared/core/events/app-event-subscription';
import { type EventPublisher } from '../../../shared/core/ports/providers/event-publisher';
import { type EventSubscriptionManager } from '../../../shared/core/ports/providers/event-subscription-manager';
import { type TripDomainEvent } from '../events/trip-domain-event';
import { type TripUnitOfWork } from '../ports/repositories/trip-unit-of-work';
import { type ConfirmTripUseCase } from '../usecases/confirm-trip';
import { ExternalDriverMatchedListener } from './ext-driver-matched-listener';
import { TripBookedListener } from './trip-booked-listener';

type SubscribedEvent = TripDomainEvent | ExternalDriverMatched;

export type TripEventSubscription = AppEventSubscription<SubscribedEvent>;

export function createTripEventSubscription({
  eventManager,
  eventPublisher,
  unitOfWork,
  confirmTripUseCase,
}: {
  eventManager: EventSubscriptionManager;
  eventPublisher: EventPublisher;
  unitOfWork: TripUnitOfWork;
  confirmTripUseCase: ConfirmTripUseCase;
}): TripEventSubscription {
  return new AppEventSubscription<SubscribedEvent>(eventManager, [
    new TripBookedListener(eventPublisher, unitOfWork),
    new ExternalDriverMatchedListener(confirmTripUseCase),
  ]);
}
