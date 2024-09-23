import { type Driver } from '#drivers/core/structures/driver'

export abstract class DriverRepository {
  abstract findAvailableDrivers(): Promise<Driver[]>
  abstract update(driver: Driver): Promise<void>
}
