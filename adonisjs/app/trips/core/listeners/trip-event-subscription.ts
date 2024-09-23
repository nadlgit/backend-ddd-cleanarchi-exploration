import { type ExternalDriverMatched } from '#shared/core/events/external-driver-matched'
import { AppEventSubscription } from '#shared/core/events/app-event-subscription'
import { type EventPublisher } from '#shared/core/ports/providers/event-publisher'
import { type EventSubscriptionManager } from '#shared/core/ports/providers/event-subscription-manager'
import { type TripDomainEvent } from '#trips/core/events/trip-domain-event'
import { ExternalDriverMatchedListener } from '#trips/core/listeners/ext-driver-matched-listener'
import { TripBookedListener } from '#trips/core/listeners/trip-booked-listener'
import { type TripUnitOfWork } from '#trips/core/ports/repositories/trip-unit-of-work'
import { type ConfirmTripUseCase } from '#trips/core/usecases/confirm-trip'

export class TripEventSubscription extends AppEventSubscription<
  TripDomainEvent | ExternalDriverMatched
> {}

export function createTripEventSubscription({
  eventManager,
  eventPublisher,
  unitOfWork,
  confirmTripUseCase,
}: {
  eventManager: EventSubscriptionManager
  eventPublisher: EventPublisher
  unitOfWork: TripUnitOfWork
  confirmTripUseCase: ConfirmTripUseCase
}) {
  return new TripEventSubscription(eventManager, [
    new TripBookedListener(eventPublisher, unitOfWork),
    new ExternalDriverMatchedListener(confirmTripUseCase),
  ])
}
