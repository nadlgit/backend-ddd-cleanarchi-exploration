import { type QueryClientContract } from '@adonisjs/lucid/types/database'
import { type DriverRepository } from '#drivers/core/ports/repositories/driver-repository'
import { Driver } from '#drivers/core/structures/driver'
import PgSqlDriver from '#drivers/gateways/repositories/pgsql/models/pgsql-driver'

export class PgSqlDriverRepository implements DriverRepository {
  constructor(private readonly queryClient: QueryClientContract) {}

  async findAvailableDrivers(): Promise<Driver[]> {
    const dbDrivers = await PgSqlDriver.findManyBy(
      { isAvailable: true },
      { client: this.queryClient }
    )
    return dbDrivers.map(({ id, name, carCategory, isAvailable, location, currentTripId }) =>
      Driver.fromSnapshot({
        id,
        name,
        carCategory,
        isAvailable,
        location,
        currentTripId,
      })
    )
  }

  async update(driver: Driver) {
    const snapshot = driver.toSnapshot()
    await PgSqlDriver.updateOrCreate({ id: snapshot.id }, snapshot, { client: this.queryClient })
  }
}
