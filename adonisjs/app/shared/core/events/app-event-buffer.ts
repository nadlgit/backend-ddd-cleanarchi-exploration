import { type AnyAppEvent } from '#shared/core/events/app-event'

export type AppEventBuffer<T extends AnyAppEvent> = {
  getEvents: () => T[]
  clearEvents: () => void
}
