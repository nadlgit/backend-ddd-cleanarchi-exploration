import { test } from '@japa/runner'
import { type AppEvent } from '#shared/core/events/app-event'
import { DomainEventService } from '#shared/core/events/domain-event-service'
import { type DomainEventOutbox } from '#shared/core/ports/repositories/domain-event-outbox'
import { type UnitOfWork } from '#shared/core/ports/repositories/unit-of-work'
import { InMemoryDomainEventOutbox } from '#shared/gateways/repositories/inmemory-domain-event-outbox'
import { InMemoryUnitOfWork } from '#shared/gateways/repositories/inmemory-unit-of-work'
import { MockPublisher } from '#shared/test-utils/providers/mock-publisher'

type TestEventType1 = AppEvent<'TEST_EVENT_TYPE_1', string>
type TestEventType2 = AppEvent<'TEST_EVENT_TYPE_2', { foo: number }>
type TestDomainEvent = TestEventType1 | TestEventType2
type TestUnitOfWorkRepositories = {
  domainEventOutbox: DomainEventOutbox<TestDomainEvent>
}
class InMemoryTestUnitOfWork
  extends InMemoryUnitOfWork<TestUnitOfWorkRepositories>
  implements UnitOfWork<TestUnitOfWorkRepositories>
{
  constructor(domainEventOutbox: InMemoryDomainEventOutbox<TestDomainEvent>) {
    super({ domainEventOutbox })
  }
}

test.group('Publish pending domain events', (group) => {
  const event1: TestEventType1 = {
    id: 'event1',
    occurredAt: new Date('2020-12-01 22:19:47'),
    type: 'TEST_EVENT_TYPE_1',
    data: 'something',
  }
  const event2: TestEventType1 = {
    id: 'event2',
    occurredAt: new Date('2020-12-01 22:19:55'),
    type: 'TEST_EVENT_TYPE_1',
    data: 'details',
  }
  const event3: TestEventType2 = {
    id: 'event3',
    occurredAt: new Date('2020-12-01 22:20:01'),
    type: 'TEST_EVENT_TYPE_2',
    data: { foo: 123 },
  }

  let service: DomainEventService<TestDomainEvent, TestUnitOfWorkRepositories>
  let outbox: InMemoryDomainEventOutbox<TestDomainEvent>
  let publisher: MockPublisher
  group.each.setup(() => {
    outbox = new InMemoryDomainEventOutbox<TestDomainEvent>([
      { event: event1, status: 'PENDING' },
      { event: event2, status: 'PROCESSED' },
      { event: event3, status: 'PENDING' },
    ])
    publisher = new MockPublisher()
    service = new DomainEventService(new InMemoryTestUnitOfWork(outbox), publisher)
  })

  test('publishes only pending events', async ({ expect }) => {
    await service.publishPendingEvents()
    expect(publisher.calls).toHaveLength(2)
    expect(publisher.calls).toContainEqual([event1])
    expect(publisher.calls).toContainEqual([event3])
  })

  test('acknowlegdes event publishing', async ({ expect }) => {
    await service.publishPendingEvents()
    expect(outbox.messages).toEqual([
      { event: event1, status: 'PROCESSED' },
      { event: event2, status: 'PROCESSED' },
      { event: event3, status: 'PROCESSED' },
    ])
  })
})
