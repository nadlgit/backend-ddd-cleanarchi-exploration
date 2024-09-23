import { PgSqlTestDatabase } from '../../../../shared/test-utils/database/pgsql-test-database';
import { type TripBooked } from '../../../core/events/trip-booked';
import { type TripConfirmed } from '../../../core/events/trip-confirmed';
import { PgSqlTripDomainEvent } from './entities/pgsql-trip-domain-event';
import { PgSqlTripDomainEventOutbox } from './pgsql-trip-domain-event-outbox';

describe('PostgreSQL trip domain event outbox repository', () => {
  let repository: PgSqlTripDomainEventOutbox;
  let db: PgSqlTestDatabase;
  const initDbEvents = async (events: PgSqlTripDomainEvent[]) => {
    const dbEvents = events.map((event) =>
      db.entityManager.create(PgSqlTripDomainEvent, event),
    );
    await db.entityManager.save(dbEvents);
  };
  const expectDbEventsToEqual = async (events: PgSqlTripDomainEvent[]) => {
    const dbEvents = await db.entityManager.find(PgSqlTripDomainEvent);
    expect(dbEvents).toHaveLength(events.length);
    for (const event of events) {
      expect(dbEvents).toContainEqual(event);
    }
  };

  const event1: TripBooked = {
    id: 'a6693bf1-965a-4201-825c-b8f28307f08c',
    occurredAt: new Date('2020-12-01 22:19:47'),
    type: 'TRIP_BOOKED',
    data: { tripId: 'b6a53eb6-8368-46b0-8111-c85bcc9f2cc9' },
  };
  const event2: TripBooked = {
    id: '3bf1a669-965a-4201-825c-b8f28307f08c',
    occurredAt: new Date('2020-12-01 22:25:15'),
    type: 'TRIP_BOOKED',
    data: { tripId: '81113eb6-8368-46b0-b6a5-c85bcc9f2cc9' },
  };
  const event3: TripConfirmed = {
    id: 'f08ca669-965a-4201-825c-b8f283073bf1',
    occurredAt: new Date('2020-12-01 22:20:01'),
    type: 'TRIP_CONFIRMED',
    data: { tripId: '2cc98111-8368-46b0-b6a5-c85bcc9f3eb6' },
  };

  beforeAll(async () => {
    db = await PgSqlTestDatabase.setup();
  });

  beforeEach(async () => {
    await db.clear();
    repository = new PgSqlTripDomainEventOutbox(db.entityManager);
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
