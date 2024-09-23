import { type DriverDomainEvent } from '#drivers/core/events/driver-domain-event'
import { type MatchDriverUseCase } from '#drivers/core/usecases/match-driver'
import { DriverMatchedListener } from '#drivers/core/listeners/driver-matched-listener'
import { ExternalTripBookedListener } from '#drivers/core/listeners/ext-trip-booked-listener'
import { NoDriverAvailableListener } from '#drivers/core/listeners/no-available-driver-listener'
import { AppEventSubscription } from '#shared/core/events/app-event-subscription'
import { type ExternalTripBooked } from '#shared/core/events/external-trip-booked'
import { type EventPublisher } from '#shared/core/ports/providers/event-publisher'
import { type EventSubscriptionManager } from '#shared/core/ports/providers/event-subscription-manager'

export class DriverEventSubscription extends AppEventSubscription<
  DriverDomainEvent | ExternalTripBooked
> {}

export function createDriverEventSubscription({
  eventManager,
  matchDriverUseCase,
  eventPublisher,
}: {
  eventManager: EventSubscriptionManager
  matchDriverUseCase: MatchDriverUseCase
  eventPublisher: EventPublisher
}) {
  return new DriverEventSubscription(eventManager, [
    new ExternalTripBookedListener(matchDriverUseCase),
    new DriverMatchedListener(eventPublisher),
    new NoDriverAvailableListener(eventPublisher),
  ])
}
