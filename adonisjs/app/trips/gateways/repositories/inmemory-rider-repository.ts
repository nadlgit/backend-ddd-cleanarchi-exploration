import { TestErrorTrigger } from '#shared/test-utils/helpers/test-error-trigger'
import { type RiderRepository } from '#trips/core/ports/repositories/rider-repository'
import { Rider, type RiderSnapshot } from '#trips/core/structures/rider'

export class InMemoryRiderRepository implements RiderRepository {
  private _errorTriggerActions = ['findById', 'update'] as const
  private _testErrorTrigger: TestErrorTrigger<(typeof this._errorTriggerActions)[number]> =
    new TestErrorTrigger()
  setTestErrorTrigger = (action: (typeof this._errorTriggerActions)[number], error: Error) =>
    this._testErrorTrigger.setErrorTrigger(action, error)
  resetTestErrorTrigger = (action: (typeof this._errorTriggerActions)[number]) =>
    this._testErrorTrigger.resetErrorTrigger(action)

  private _riderSnapshots: RiderSnapshot[] = []

  constructor(riderSnapshots: RiderSnapshot[] = []) {
    this._riderSnapshots.push(...structuredClone(riderSnapshots))
  }

  async findById(id: string): Promise<Rider | null> {
    this._testErrorTrigger.triggerErrorIfSet('findById')

    const snapshot = this._riderSnapshots.find(({ id: riderId }) => riderId === id)
    if (!snapshot) {
      return null
    }
    return Rider.fromSnapshot(snapshot)
  }

  async update(rider: Rider) {
    this._testErrorTrigger.triggerErrorIfSet('update')

    const snapshot = rider.toSnapshot()
    const index = this._riderSnapshots.findIndex(({ id }) => id === snapshot.id)
    if (index < 0) {
      return
    }
    this._riderSnapshots[index] = structuredClone(snapshot)
  }

  get riderSnapshots(): RiderSnapshot[] {
    return structuredClone(this._riderSnapshots)
  }
}
