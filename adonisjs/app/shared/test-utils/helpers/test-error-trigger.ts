export class TestErrorTrigger<T extends string> {
  private errorTriggers: Partial<Record<T, Error>> = {}

  setErrorTrigger(action: T, error: Error) {
    this.errorTriggers[action] = error
  }

  resetErrorTrigger(action: T) {
    delete this.errorTriggers[action]
  }

  triggerErrorIfSet(action: T) {
    if (this.errorTriggers[action]) {
      throw this.errorTriggers[action]
    }
  }
}
