import { type AnyAppEvent } from '#shared/core/events/app-event'

export abstract class EventPublisher {
  abstract publish: <T extends AnyAppEvent>(event: T) => Promise<void>
}
