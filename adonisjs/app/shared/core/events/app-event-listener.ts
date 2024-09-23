import { type AnyAppEvent } from '#shared/core/events/app-event'

export type AppEventListener<T extends AnyAppEvent> = {
  readonly eventType: T['type']
  readonly eventHandlers: ReadonlyArray<(event: T) => void | Promise<void>>
}
