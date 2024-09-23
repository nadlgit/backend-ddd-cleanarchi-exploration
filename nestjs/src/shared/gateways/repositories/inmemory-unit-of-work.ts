import { type UnitOfWork } from '../../core/ports/repositories/unit-of-work';

type FakeTransaction = { status: 'STARTED' | 'COMMITTED' | 'ROLLED_BACK' };

export abstract class InMemoryUnitOfWork<R> implements UnitOfWork<R> {
  private _transactions: FakeTransaction[] = [];

  constructor(private readonly _repositories: R) {}

  async execute<T>(operation: (repositories: R) => Promise<T>): Promise<T> {
    return operation(this._repositories);
  }

  async executeInTransaction<T>(
    operation: (repositories: R) => Promise<T>,
  ): Promise<T> {
    const transaction: FakeTransaction = {
      status: 'STARTED',
    };
    this._transactions.push(transaction);
    try {
      const result = await operation(this._repositories);
      transaction.status = 'COMMITTED';
      return result;
    } catch (error) {
      transaction.status = 'ROLLED_BACK';
      throw error;
    }
  }

  get transactions() {
    return structuredClone(this._transactions);
  }
}
