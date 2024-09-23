import { type AnyAppEvent } from '../../events/app-event';

export type EventPublisher = {
  publish: <T extends AnyAppEvent>(event: T) => Promise<void>;
};
