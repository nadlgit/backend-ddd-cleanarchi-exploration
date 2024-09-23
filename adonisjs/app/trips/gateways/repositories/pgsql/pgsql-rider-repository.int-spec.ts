import { test } from '@japa/runner'
import { PgSqlTestDatabase } from '#shared/test-utils/database/pgsql-test-database'
import { Rider, type RiderSnapshot } from '#trips/core/structures/rider'
import PgSqlRider from '#trips/gateways/repositories/pgsql/models/pgsql-rider'
import { PgSqlRiderRepository } from '#trips/gateways/repositories/pgsql/pgsql-rider-repository'

test.group('PostgreSQL rider repository', (group) => {
  let repository: PgSqlRiderRepository
  let db: PgSqlTestDatabase
  const initDbRiders = async (riders: RiderSnapshot[]) => {
    await PgSqlRider.createMany(riders, { client: db.queryClient })
  }

  const rider1: RiderSnapshot = {
    id: 'f1c47471-bbc8-47d4-a158-a5a247a661ac',
    birthDate: '2000-01-01',
    plan: 'BASIC',
  }

  const rider2: RiderSnapshot = {
    id: '7471f1c4-bbc8-47d4-a158-a5a247a661ac',
    birthDate: '1985-10-12',
    plan: 'BASIC',
  }

  const rider3: RiderSnapshot = {
    id: '61ac7471-bbc8-47d4-a158-a5a247a6f1c4',
    birthDate: '2001-12-24',
    plan: 'PREMIUM',
  }

  group.setup(async () => {
    db = await PgSqlTestDatabase.setup()
    return async () => {
      await db.teardown()
    }
  })

  group.each.setup(async () => {
    await db.clear()
    repository = new PgSqlRiderRepository(db.queryClient)
  })

  test('gets rider given existing rider id', async ({ expect }) => {
    await initDbRiders([rider1, rider2, rider3])
    const rider = await repository.findById(rider1.id)
    expect(rider?.toSnapshot()).toEqual(rider1)
  })

  test('returns null given rider id not found', async ({ expect }) => {
    await initDbRiders([])
    const rider = await repository.findById(rider1.id)
    expect(rider).toBeNull()
  })

  test('updates rider', async ({ assert }) => {
    const initialRider: RiderSnapshot = {
      ...rider2,
      birthDate: '2000-01-01',
      plan: 'BASIC',
    }
    await initDbRiders([rider1, initialRider, rider3])
    const updatedRider: RiderSnapshot = {
      ...initialRider,
      birthDate: '2001-04-15',
      plan: 'PREMIUM',
    }
    await repository.update(Rider.fromSnapshot(updatedRider))
    const dbRiders = await PgSqlRider.all({ client: db.queryClient })
    assert.sameDeepMembers(
      dbRiders.map(({ id, birthDate, plan }) => ({ id, birthDate, plan })),
      [rider1, updatedRider, rider3]
    )
  })
})
