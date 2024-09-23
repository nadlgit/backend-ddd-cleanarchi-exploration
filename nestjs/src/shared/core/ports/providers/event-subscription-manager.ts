import { type AnyAppEvent } from '../../events/app-event';

type EventSubscription = <T extends AnyAppEvent>(
  eventType: T['type'],
  listener: (event: T) => void | Promise<void>,
) => void;

export type EventSubscriptionManager = {
  addListener: EventSubscription;
  removeListener: EventSubscription;
};
