import { type AnyAppEvent } from './app-event';

export type AppEventListener<T extends AnyAppEvent> = {
  readonly eventType: T['type'];
  readonly eventHandlers: ReadonlyArray<(event: T) => void | Promise<void>>;
};
