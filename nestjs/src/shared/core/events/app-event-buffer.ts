import { type AnyAppEvent } from './app-event';

export type AppEventBuffer<T extends AnyAppEvent> = {
  getEvents: () => T[];
  clearEvents: () => void;
};
