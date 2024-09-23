import { type Driver } from '../../structures/driver';

export type DriverRepository = {
  findAvailableDrivers(): Promise<Driver[]>;
  update(driver: Driver): Promise<void>;
};
