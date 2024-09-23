import { AppEventSubscription } from '../../../shared/core/events/app-event-subscription';
import { type ExternalTripBooked } from '../../../shared/core/events/external-trip-booked';
import { type EventPublisher } from '../../../shared/core/ports/providers/event-publisher';
import { type EventSubscriptionManager } from '../../../shared/core/ports/providers/event-subscription-manager';
import { type DriverDomainEvent } from '../events/driver-domain-event';
import { type MatchDriverUseCase } from '../usecases/match-driver';
import { DriverMatchedListener } from './driver-matched-listener';
import { ExternalTripBookedListener } from './ext-trip-booked-listener';
import { NoDriverAvailableListener } from './no-available-driver-listener';

type SubscribedEvent = DriverDomainEvent | ExternalTripBooked;

export type DriverEventSubscription = AppEventSubscription<SubscribedEvent>;

export function createDriverEventSubscription({
  eventManager,
  matchDriverUseCase,
  eventPublisher,
}: {
  eventManager: EventSubscriptionManager;
  matchDriverUseCase: MatchDriverUseCase;
  eventPublisher: EventPublisher;
}): DriverEventSubscription {
  return new AppEventSubscription<SubscribedEvent>(eventManager, [
    new ExternalTripBookedListener(matchDriverUseCase),
    new DriverMatchedListener(eventPublisher),
    new NoDriverAvailableListener(eventPublisher),
  ]);
}
