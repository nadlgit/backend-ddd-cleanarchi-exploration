import { InMemoryDomainEventOutbox } from '../../gateways/repositories/inmemory-domain-event-outbox';
import { InMemoryUnitOfWork } from '../../gateways/repositories/inmemory-unit-of-work';
import { type EventPublisher } from '../ports/providers/event-publisher';
import { type DomainEventOutbox } from '../ports/repositories/domain-event-outbox';
import { type UnitOfWork } from '../ports/repositories/unit-of-work';
import { type AppEvent } from './app-event';
import { DomainEventService } from './domain-event-service';

type TestEventType1 = AppEvent<'TEST_EVENT_TYPE_1', string>;
type TestEventType2 = AppEvent<'TEST_EVENT_TYPE_2', { foo: number }>;
type TestDomainEvent = TestEventType1 | TestEventType2;
type TestUnitOfWorkRepositories = {
  domainEventOutbox: DomainEventOutbox<TestDomainEvent>;
};
class InMemoryTestUnitOfWork
  extends InMemoryUnitOfWork<TestUnitOfWorkRepositories>
  implements UnitOfWork<TestUnitOfWorkRepositories>
{
  constructor(domainEventOutbox: InMemoryDomainEventOutbox<TestDomainEvent>) {
    super({ domainEventOutbox });
  }
}

describe('Publish pending domain events', () => {
  const event1: TestEventType1 = {
    id: 'event1',
    occurredAt: new Date('2020-12-01 22:19:47'),
    type: 'TEST_EVENT_TYPE_1',
    data: 'something',
  };
  const event2: TestEventType1 = {
    id: 'event2',
    occurredAt: new Date('2020-12-01 22:19:55'),
    type: 'TEST_EVENT_TYPE_1',
    data: 'details',
  };
  const event3: TestEventType2 = {
    id: 'event3',
    occurredAt: new Date('2020-12-01 22:20:01'),
    type: 'TEST_EVENT_TYPE_2',
    data: { foo: 123 },
  };

  let service: DomainEventService<TestDomainEvent, TestUnitOfWorkRepositories>;
  let outbox: InMemoryDomainEventOutbox<TestDomainEvent>;
  let publisher: EventPublisher;
  beforeEach(() => {
    outbox = new InMemoryDomainEventOutbox<TestDomainEvent>([
      { event: event1, status: 'PENDING' },
      { event: event2, status: 'PROCESSED' },
      { event: event3, status: 'PENDING' },
    ]);
    publisher = { publish: jest.fn() };
    service = new DomainEventService(
      new InMemoryTestUnitOfWork(outbox),
      publisher,
    );
  });

  it('publishes only pending events', async () => {
    await service.publishPendingEvents();
    expect(publisher.publish).toHaveBeenCalledWith(event1);
    expect(publisher.publish).not.toHaveBeenCalledWith(event2);
    expect(publisher.publish).toHaveBeenCalledWith(event3);
  });

  it('acknowlegdes event publishing', async () => {
    await service.publishPendingEvents();
    expect(outbox.messages).toEqual([
      { event: event1, status: 'PROCESSED' },
      { event: event2, status: 'PROCESSED' },
      { event: event3, status: 'PROCESSED' },
    ]);
  });
});
