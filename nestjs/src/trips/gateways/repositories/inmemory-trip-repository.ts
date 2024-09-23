import { TestErrorTrigger } from '../../../shared/test-utils/helpers/test-error-trigger';
import { type TripRepository } from '../../core/ports/repositories/trip-repository';
import { Trip, type TripSnapshot } from '../../core/structures/trip';
import { type TripStatus } from '../../core/structures/trip-status';

export class InMemoryTripRepository implements TripRepository {
  private _errorTriggerActions = [
    'findById',
    'getRiderTripCountByStatus',
    'getRiderTripCountSince',
    'insert',
    'update',
  ] as const;
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

  private _tripSnapshots: TripSnapshot[] = [];

  constructor(tripSnapshots: TripSnapshot[] = []) {
    this._tripSnapshots.push(...structuredClone(tripSnapshots));
  }

  async findById(id: string): Promise<Trip | null> {
    this._testErrorTrigger.triggerErrorIfSet('findById');

    const snapshot = this._tripSnapshots.find(
      ({ id: tripId }) => tripId === id,
    );
    if (!snapshot) {
      return null;
    }
    return Trip.fromSnapshot(snapshot);
  }

  async getRiderTripCountByStatus(
    riderId: string,
  ): Promise<Partial<Record<TripStatus, number>>> {
    this._testErrorTrigger.triggerErrorIfSet('getRiderTripCountByStatus');

    return this._tripSnapshots.reduce<Partial<Record<TripStatus, number>>>(
      (acc, { riderId: tripRiderId, status }) => {
        if (tripRiderId === riderId) {
          acc[status] = (acc[status] ?? 0) + 1;
        }
        return acc;
      },
      {},
    );
  }

  async getRiderTripCountSince(
    riderId: string,
    startDateTime: Date,
  ): Promise<number> {
    this._testErrorTrigger.triggerErrorIfSet('getRiderTripCountSince');

    return this._tripSnapshots.reduce(
      (acc, { riderId: tripRiderId, bookedOn }) =>
        tripRiderId === riderId && bookedOn >= startDateTime ? acc + 1 : acc,
      0,
    );
  }

  async insert(trip: Trip) {
    this._testErrorTrigger.triggerErrorIfSet('insert');

    this._tripSnapshots.push(trip.toSnapshot());
  }

  async update(trip: Trip) {
    this._testErrorTrigger.triggerErrorIfSet('update');

    const snapshot = trip.toSnapshot();
    const index = this._tripSnapshots.findIndex(({ id }) => id === snapshot.id);
    if (index < 0) {
      return;
    }
    this._tripSnapshots[index] = structuredClone(snapshot);
  }

  get tripSnapshots(): TripSnapshot[] {
    return structuredClone(this._tripSnapshots);
  }
}
