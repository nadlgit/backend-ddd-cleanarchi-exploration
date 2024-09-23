import { type AnyAppEvent } from '#shared/core/events/app-event'
import { type DomainEventOutbox } from '#shared/core/ports/repositories/domain-event-outbox'
import { TestErrorTrigger } from '#shared/test-utils/helpers/test-error-trigger'

export class InMemoryDomainEventOutbox<T extends AnyAppEvent> implements DomainEventOutbox<T> {
  private _errorTriggerActions = ['addEvents', 'fetchPendingEvents', 'acknowledgeEvents'] as const
  private _testErrorTrigger: TestErrorTrigger<(typeof this._errorTriggerActions)[number]> =
    new TestErrorTrigger()
  setTestErrorTrigger = (action: (typeof this._errorTriggerActions)[number], error: Error) =>
    this._testErrorTrigger.setErrorTrigger(action, error)
  resetTestErrorTrigger = (action: (typeof this._errorTriggerActions)[number]) =>
    this._testErrorTrigger.resetErrorTrigger(action)

  private _messages: Record<string, { event: T; status: 'PENDING' | 'PROCESSED' }> = {}

  constructor(messages: { event: T; status: 'PENDING' | 'PROCESSED' }[] = []) {
    for (const { event, status } of messages) {
      this._messages[event.id] = { event: structuredClone(event), status }
    }
  }

  get messages() {
    return Object.values(this._messages)
  }

  async addEvents(events: T[]) {
    this._testErrorTrigger.triggerErrorIfSet('addEvents')

    for (const event of events) {
      this._messages[event.id] = { event, status: 'PENDING' }
    }
  }

  async fetchPendingEvents() {
    this._testErrorTrigger.triggerErrorIfSet('fetchPendingEvents')

    return this.messages.filter(({ status }) => status === 'PENDING').map(({ event }) => event)
  }

  async acknowledgeEvents(eventIds: string[]) {
    this._testErrorTrigger.triggerErrorIfSet('acknowledgeEvents')

    for (const id of eventIds) {
      if (id !== undefined) {
        this._messages[id].status = 'PROCESSED'
      }
    }
  }
}
