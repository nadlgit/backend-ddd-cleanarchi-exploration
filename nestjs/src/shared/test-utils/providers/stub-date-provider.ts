import { type DateProvider } from '../../core/ports/providers/date-provider';

export class StubDateProvider implements DateProvider {
  private _currentDateTime = new Date();

  currentDateTime() {
    return this._currentDateTime;
  }

  setCurrentDateTime(datetime: Date) {
    this._currentDateTime = datetime;
  }
}
