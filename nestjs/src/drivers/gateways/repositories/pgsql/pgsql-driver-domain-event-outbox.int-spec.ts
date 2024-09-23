import { PgSqlTestDatabase } from '../../../../shared/test-utils/database/pgsql-test-database';
import { type DriverMatched } from '../../../core/events/driver-matched';
import { type NoDriverAvailable } from '../../../core/events/no-driver-available';
import { PgSqlDriverDomainEvent } from './entities/pgsql-driver-domain-event';
import { PgSqlDriverDomainEventOutbox } from './pgsql-driver-domain-event-outbox';

describe('PostgreSQL driver domain event outbox repository', () => {
  let repository: PgSqlDriverDomainEventOutbox;
  let db: PgSqlTestDatabase;
  const initDbEvents = async (events: PgSqlDriverDomainEvent[]) => {
    const dbEvents = events.map((event) =>
      db.entityManager.create(PgSqlDriverDomainEvent, event),
    );
    await db.entityManager.save(dbEvents);
  };
  const expectDbEventsToEqual = async (events: PgSqlDriverDomainEvent[]) => {
    const dbEvents = await db.entityManager.find(PgSqlDriverDomainEvent);
    expect(dbEvents).toHaveLength(events.length);
    for (const event of events) {
      expect(dbEvents).toContainEqual(event);
    }
  };

  const event1: DriverMatched = {
    id: 'a6693bf1-965a-4201-825c-b8f28307f08c',
    occurredAt: new Date('2020-12-01 22:19:47'),
    type: 'DRIVER_MATCHED',
    data: {
      driverId: '7471f1c4-bbc8-47d4-a158-a661aca5a247',
      tripId: 'b6a53eb6-8368-46b0-8111-c85bcc9f2cc9',
    },
  };
  const event2: DriverMatched = {
    id: '3bf1a669-965a-4201-825c-b8f28307f08c',
    occurredAt: new Date('2020-12-01 22:25:15'),
    type: 'DRIVER_MATCHED',
    data: {
      driverId: 'f1c47471-bbc8-47d4-a158-a661aca5a247',
      tripId: '81113eb6-8368-46b0-b6a5-c85bcc9f2cc9',
    },
  };
  const event3: NoDriverAvailable = {
    id: 'f08ca669-965a-4201-825c-b8f283073bf1',
    occurredAt: new Date('2020-12-01 22:20:01'),
    type: 'NO_DRIVER_AVAILABLE',
    data: { tripId: '2cc98111-8368-46b0-b6a5-c85bcc9f3eb6' },
  };

  beforeAll(async () => {
    db = await PgSqlTestDatabase.setup();
  });

  beforeEach(async () => {
    await db.clear();
    repository = new PgSqlDriverDomainEventOutbox(db.entityManager);
  });

  afterAll(async () => {
    await db.teardown();
  });

  describe('addEvents()', () => {
    it('adds events and sets status to PENDING', async () => {
      const events = [event1, event2, event3];
      await repository.addEvents(events);
      await expectDbEventsToEqual([
        { ...event1, status: 'PENDING' },
        { ...event2, status: 'PENDING' },
        { ...event3, status: 'PENDING' },
      ]);
    });
  });

  describe('fetchPendingEvents()', () => {
    it('gets events with status PENDING', async () => {
      await initDbEvents([
        { ...event1, status: 'PENDING' },
        { ...event2, status: 'PROCESSED' },
        { ...event3, status: 'PENDING' },
      ]);
      const events = await repository.fetchPendingEvents();
      expect(events).toEqual([event1, event3]);
    });
  });

  describe('acknowledgeEvents()', () => {
    it('sets acknowledged events status to PROCESSED', async () => {
      await initDbEvents([
        { ...event1, status: 'PENDING' },
        { ...event2, status: 'PENDING' },
        { ...event3, status: 'PENDING' },
      ]);
      await repository.acknowledgeEvents([event3.id, event2.id]);
      await expectDbEventsToEqual([
        { ...event1, status: 'PENDING' },
        { ...event2, status: 'PROCESSED' },
        { ...event3, status: 'PROCESSED' },
      ]);
    });
  });
});
