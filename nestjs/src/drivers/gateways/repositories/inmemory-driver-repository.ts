import { TestErrorTrigger } from '../../../shared/test-utils/helpers/test-error-trigger';
import { type DriverRepository } from '../../core/ports/repositories/driver-repository';
import { Driver, type DriverSnapshot } from '../../core/structures/driver';

export class InMemoryDriverRepository implements DriverRepository {
  private _errorTriggerActions = ['findAvailableDrivers', 'update'] as const;
  private _testErrorTrigger: TestErrorTrigger<
    (typeof this._errorTriggerActions)[number]
  > = new TestErrorTrigger();
  setTestErrorTrigger = (
    action: (typeof this._errorTriggerActions)[number],
    error: Error,
  ) => this._testErrorTrigger.setErrorTrigger(action, error);
  resetTestErrorTrigger = (
    action: (typeof this._errorTriggerActions)[number],
  ) => this._testErrorTrigger.resetErrorTrigger(action);

  private _driverSnapshots: DriverSnapshot[] = [];

  constructor(driverSnapshots: DriverSnapshot[] = []) {
    this._driverSnapshots.push(...structuredClone(driverSnapshots));
  }

  async findAvailableDrivers(): Promise<Driver[]> {
    this._testErrorTrigger.triggerErrorIfSet('findAvailableDrivers');

    return this._driverSnapshots
      .filter(({ isAvailable }) => isAvailable)
      .map((snapshot) => Driver.fromSnapshot(snapshot));
  }

  async update(driver: Driver) {
    this._testErrorTrigger.triggerErrorIfSet('update');

    const snapshot = driver.toSnapshot();
    const index = this._driverSnapshots.findIndex(
      ({ id }) => id === snapshot.id,
    );
    if (index < 0) {
      return;
    }
    this._driverSnapshots[index] = structuredClone(snapshot);
  }

  get driverSnapshots(): DriverSnapshot[] {
    return structuredClone(this._driverSnapshots);
  }
}
