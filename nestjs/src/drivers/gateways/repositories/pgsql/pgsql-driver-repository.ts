import { type EntityManager } from 'typeorm';
import { type DriverRepository } from '../../../core/ports/repositories/driver-repository';
import { Driver } from '../../../core/structures/driver';
import { PgSqlDriver } from './entities/pgsql-driver';

export class PgSqlDriverRepository implements DriverRepository {
  constructor(private readonly entityManager: EntityManager) {}

  async findAvailableDrivers(): Promise<Driver[]> {
    const dbRepository = this.entityManager.getRepository(PgSqlDriver);
    const dbEntities = await dbRepository.findBy({ isAvailable: true });
    return dbEntities.map(
      ({ id, name, carCategory, isAvailable, location, currentTripId }) =>
        Driver.fromSnapshot({
          id,
          name,
          carCategory,
          isAvailable,
          location,
          currentTripId,
        }),
    );
  }

  async update(driver: Driver) {
    const { id, name, carCategory, isAvailable, location, currentTripId } =
      driver.toSnapshot();
    const dbRepository = this.entityManager.getRepository(PgSqlDriver);
    await dbRepository.save(
      dbRepository.create({
        id,
        name,
        carCategory,
        isAvailable,
        location,
        currentTripId,
      }),
    );
  }
}
