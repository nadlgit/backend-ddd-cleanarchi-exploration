import { type IdProvider } from '../../core/ports/providers/id-provider';

export class StubIdProvider implements IdProvider {
  private _id = 'stub-id';

  generate() {
    return this._id;
  }

  setId(id: string) {
    this._id = id;
  }
}
