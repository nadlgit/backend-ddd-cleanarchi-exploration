import { type AnyAppEvent } from '../../events/app-event';

export type DomainEventOutbox<T extends AnyAppEvent> = {
  addEvents: (events: T[]) => Promise<void>;
  fetchPendingEvents: () => Promise<T[]>;
  acknowledgeEvents: (eventIds: string[]) => Promise<void>;
};
