import { type ModelAttributes } from '@adonisjs/lucid/types/model'
import { test } from '@japa/runner'
import { type DriverMatched } from '#drivers/core/events/driver-matched'
import { type NoDriverAvailable } from '#drivers/core/events/no-driver-available'
import PgSqlDriverDomainEvent from '#drivers/gateways/repositories/pgsql/models/pgsql-driver-domain-event'
import { PgSqlDriverDomainEventOutbox } from '#drivers/gateways/repositories/pgsql/pgsql-driver-domain-event-outbox'
import { PgSqlTestDatabase } from '#shared/test-utils/database/pgsql-test-database'

test.group('PostgreSQL driver domain event outbox repository', (group) => {
  let repository: PgSqlDriverDomainEventOutbox
  let db: PgSqlTestDatabase
  const initDbEvents = async (events: ModelAttributes<PgSqlDriverDomainEvent>[]) => {
    await PgSqlDriverDomainEvent.createMany(events, { client: db.queryClient })
  }

  const event1: DriverMatched = {
    id: 'a6693bf1-965a-4201-825c-b8f28307f08c',
    occurredAt: new Date('2020-12-01 22:19:47'),
    type: 'DRIVER_MATCHED',
    data: {
      driverId: '7471f1c4-bbc8-47d4-a158-a661aca5a247',
      tripId: 'b6a53eb6-8368-46b0-8111-c85bcc9f2cc9',
    },
  }
  const event2: DriverMatched = {
    id: '3bf1a669-965a-4201-825c-b8f28307f08c',
    occurredAt: new Date('2020-12-01 22:25:15'),
    type: 'DRIVER_MATCHED',
    data: {
      driverId: 'f1c47471-bbc8-47d4-a158-a661aca5a247',
      tripId: '81113eb6-8368-46b0-b6a5-c85bcc9f2cc9',
    },
  }
  const event3: NoDriverAvailable = {
    id: 'f08ca669-965a-4201-825c-b8f283073bf1',
    occurredAt: new Date('2020-12-01 22:20:01'),
    type: 'NO_DRIVER_AVAILABLE',
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
    repository = new PgSqlDriverDomainEventOutbox(db.queryClient)
  })

  test('adds events and sets status to PENDING', async ({ assert }) => {
    await repository.addEvents([event1, event2, event3])
    const dbEvents = await PgSqlDriverDomainEvent.all({ client: db.queryClient })
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
    const dbEvents = await PgSqlDriverDomainEvent.all({ client: db.queryClient })
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
