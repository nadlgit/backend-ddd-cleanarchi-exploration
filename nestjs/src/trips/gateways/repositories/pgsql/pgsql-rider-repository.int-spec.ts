import { PgSqlTestDatabase } from '../../../../shared/test-utils/database/pgsql-test-database';
import { Rider, type RiderSnapshot } from '../../../core/structures/rider';
import { PgSqlRider } from './entities/pgsql-rider';
import { PgSqlRiderRepository } from './pgsql-rider-repository';

describe('PostgreSQL rider repository', () => {
  let repository: PgSqlRiderRepository;
  let db: PgSqlTestDatabase;
  const initDbRiders = async (riders: RiderSnapshot[]) => {
    const dbRiders = riders.map((rider) =>
      db.entityManager.create(PgSqlRider, rider),
    );
    await db.entityManager.save(dbRiders);
  };
  const expectDbRidersToEqual = async (riders: RiderSnapshot[]) => {
    const dbRiders = await db.entityManager.find(PgSqlRider);
    expect(dbRiders).toHaveLength(riders.length);
    for (const rider of riders) {
      expect(dbRiders).toContainEqual(rider);
    }
  };

  const rider1: RiderSnapshot = {
    id: 'f1c47471-bbc8-47d4-a158-a5a247a661ac',
    birthDate: '2000-01-01',
    plan: 'BASIC',
  };

  const rider2: RiderSnapshot = {
    id: '7471f1c4-bbc8-47d4-a158-a5a247a661ac',
    birthDate: '1985-10-12',
    plan: 'BASIC',
  };

  const rider3: RiderSnapshot = {
    id: '61ac7471-bbc8-47d4-a158-a5a247a6f1c4',
    birthDate: '2001-12-24',
    plan: 'PREMIUM',
  };

  beforeAll(async () => {
    db = await PgSqlTestDatabase.setup();
  });

  beforeEach(async () => {
    await db.clear();
    repository = new PgSqlRiderRepository(db.entityManager);
  });

  afterAll(async () => {
    await db.teardown();
  });

  describe('findById()', () => {
    it('gets existing rider', async () => {
      await initDbRiders([rider1, rider2, rider3]);
      const rider = await repository.findById(rider1.id);
      expect(rider?.toSnapshot()).toEqual(rider1);
    });

    it('returns null given not found', async () => {
      await initDbRiders([]);
      const rider = await repository.findById(rider1.id);
      expect(rider).toBeNull();
    });
  });

  describe('update()', () => {
    it('updates rider', async () => {
      const initialRider: RiderSnapshot = {
        ...rider2,
        birthDate: '2000-01-01',
        plan: 'BASIC',
      };
      await initDbRiders([rider1, initialRider, rider3]);
      const updatedRider: RiderSnapshot = {
        ...initialRider,
        birthDate: '2001-04-15',
        plan: 'PREMIUM',
      };
      await repository.update(Rider.fromSnapshot(updatedRider));
      await expectDbRidersToEqual([rider1, updatedRider, rider3]);
    });
  });
});
