import { EventPublisher } from '#shared/core/ports/providers/event-publisher'

export class MockPublisher implements EventPublisher {
  readonly calls: any[] = []

  async publish(...params: any) {
    this.calls.push(params)
  }
}
