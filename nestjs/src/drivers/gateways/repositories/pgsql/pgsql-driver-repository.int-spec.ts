import { PgSqlTestDatabase } from '../../../../shared/test-utils/database/pgsql-test-database';
import { Driver, type DriverSnapshot } from '../../../core/structures/driver';
import { PgSqlDriver } from './entities/pgsql-driver';
import { PgSqlDriverRepository } from './pgsql-driver-repository';

describe('PostgreSQL driver repository', () => {
  let repository: PgSqlDriverRepository;
  let db: PgSqlTestDatabase;
  const initDbDrivers = async (drivers: DriverSnapshot[]) => {
    const dbDrivers = drivers.map((driver) =>
      db.entityManager.create(PgSqlDriver, driver),
    );
    await db.entityManager.save(dbDrivers);
  };
  const expectDbDriversToEqual = async (drivers: DriverSnapshot[]) => {
    const dbDrivers = await db.entityManager.find(PgSqlDriver);
    expect(dbDrivers).toHaveLength(drivers.length);
    for (const driver of drivers) {
      expect(dbDrivers).toContainEqual(driver);
    }
  };

  const driver1: DriverSnapshot = {
    id: '7471f1c4-bbc8-47d4-a158-a661aca5a247',
    name: 'John Doe',
    carCategory: 'NORMAL',
    isAvailable: false,
    location: 'Driver location 1',
    currentTripId: 'b6a53eb6-8368-46b0-8111-c85bcc9f2cc9',
  };

  const driver2: DriverSnapshot = {
    id: 'f1c47471-bbc8-47d4-a158-a661aca5a247',
    name: 'Jane Doe',
    carCategory: 'NORMAL',
    isAvailable: false,
    location: 'Driver location 2',
    currentTripId: null,
  };

  const driver3: DriverSnapshot = {
    id: 'a247f1c4-bbc8-47d4-a158-a661aca57471',
    name: 'Sam Doe',
    carCategory: 'NORMAL',
    isAvailable: false,
    location: null,
    currentTripId: null,
  };

  beforeAll(async () => {
    db = await PgSqlTestDatabase.setup();
  });

  beforeEach(async () => {
    await db.clear();
    repository = new PgSqlDriverRepository(db.entityManager);
  });

  afterAll(async () => {
    await db.teardown();
  });

  describe('findAvailableDrivers()', () => {
    it('gets available drivers', async () => {
      await initDbDrivers([
        driver1,
        { ...driver2, isAvailable: true },
        { ...driver3, isAvailable: true },
      ]);
      const drivers = await repository.findAvailableDrivers();
      expect(drivers.map((driver) => driver.toSnapshot())).toEqual([
        { ...driver2, isAvailable: true },
        { ...driver3, isAvailable: true },
      ]);
    });
  });

  describe('update()', () => {
    it('updates driver', async () => {
      const initialDriver: DriverSnapshot = {
        ...driver2,
        name: 'Jane Doe',
        carCategory: 'UBERX',
        isAvailable: true,
        location: 'Driver location 2',
        currentTripId: null,
      };
      await initDbDrivers([driver1, initialDriver, driver3]);

      const updatedDriver: DriverSnapshot = {
        ...initialDriver,
        name: 'Jennifer Doe',
        carCategory: 'NORMAL',
        isAvailable: false,
        location: null,
        currentTripId: '2cc93eb6-8368-46b0-8111-c85bcc9fb6a5',
      };
      await repository.update(Driver.fromSnapshot(updatedDriver));

      await expectDbDriversToEqual([driver1, updatedDriver, driver3]);
    });
  });
});
