import { type ModelAttributes } from '@adonisjs/lucid/types/model'
import { test } from '@japa/runner'
import { PgSqlTestDatabase } from '#shared/test-utils/database/pgsql-test-database'
import { type TripBooked } from '#trips/core/events/trip-booked'
import { type TripConfirmed } from '#trips/core/events/trip-confirmed'
import PgSqlTripDomainEvent from '#trips/gateways/repositories/pgsql/models/pgsql-trip-domain-event'
import { PgSqlTripDomainEventOutbox } from '#trips/gateways/repositories/pgsql/pgsql-trip-domain-event-outbox'

test.group('PostgreSQL trip domain event outbox repository', (group) => {
  let repository: PgSqlTripDomainEventOutbox
  let db: PgSqlTestDatabase
  const initDbEvents = async (events: ModelAttributes<PgSqlTripDomainEvent>[]) => {
    await PgSqlTripDomainEvent.createMany(events, { client: db.queryClient })
  }

  const event1: TripBooked = {
    id: 'a6693bf1-965a-4201-825c-b8f28307f08c',
    occurredAt: new Date('2020-12-01 22:19:47'),
    type: 'TRIP_BOOKED',
    data: { tripId: 'b6a53eb6-8368-46b0-8111-c85bcc9f2cc9' },
  }
  const event2: TripBooked = {
    id: '3bf1a669-965a-4201-825c-b8f28307f08c',
    occurredAt: new Date('2020-12-01 22:25:15'),
    type: 'TRIP_BOOKED',
    data: { tripId: '81113eb6-8368-46b0-b6a5-c85bcc9f2cc9' },
  }
  const event3: TripConfirmed = {
    id: 'f08ca669-965a-4201-825c-b8f283073bf1',
    occurredAt: new Date('2020-12-01 22:20:01'),
    type: 'TRIP_CONFIRMED',
    data: { tripId: '2cc98111-8368-46b0-b6a5-c85bcc9f3eb6' },
  }

  group.setup(async () => {
    db = await PgSqlTestDatabase.setup()
    return async () => {
      await db.teardown()
    }
  })

  group.each.setup(async () => {
    await db.clear()
    repository = new PgSqlTripDomainEventOutbox(db.queryClient)
  })

  test('adds events and sets status to PENDING', async ({ assert }) => {
    await repository.addEvents([event1, event2, event3])
    const dbEvents = await PgSqlTripDomainEvent.all({ client: db.queryClient })
    assert.sameDeepMembers(
      dbEvents.map(({ id, occurredAt, type, data, status }) => ({
        id,
        occurredAt,
        type,
        data,
        status,
      })),
      [
        { ...event1, status: 'PENDING' },
        { ...event2, status: 'PENDING' },
        { ...event3, status: 'PENDING' },
      ]
    )
  })

  test('fetches events with status PENDING', async ({ assert }) => {
    await initDbEvents([
      { ...event1, status: 'PENDING' },
      { ...event2, status: 'PROCESSED' },
      { ...event3, status: 'PENDING' },
    ])
    const events = await repository.fetchPendingEvents()
    assert.sameDeepMembers(events, [event1, event3])
  })

  test('sets acknowledged events status to PROCESSED', async ({ assert }) => {
    await initDbEvents([
      { ...event1, status: 'PENDING' },
      { ...event2, status: 'PENDING' },
      { ...event3, status: 'PENDING' },
    ])
    await repository.acknowledgeEvents([event3.id, event2.id])
    const dbEvents = await PgSqlTripDomainEvent.all({ client: db.queryClient })
    assert.sameDeepMembers(
      dbEvents.map(({ id, occurredAt, type, data, status }) => ({
        id,
        occurredAt,
        type,
        data,
        status,
      })),
      [
        { ...event1, status: 'PENDING' },
        { ...event2, status: 'PROCESSED' },
        { ...event3, status: 'PROCESSED' },
      ]
    )
  })
})
