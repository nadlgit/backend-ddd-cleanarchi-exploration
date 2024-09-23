import { type EntityManager } from 'typeorm';
import { type UnitOfWork } from '../../../core/ports/repositories/unit-of-work';

export abstract class PgSqlUnitOfWork<R> implements UnitOfWork<R> {
  private readonly _repositories: R;

  constructor(private readonly entityManager: EntityManager) {
    this._repositories = this.createRepositories(entityManager);
  }

  async execute<T>(operation: (repositories: R) => Promise<T>): Promise<T> {
    return operation(this._repositories);
  }

  async executeInTransaction<T>(
    operation: (repositories: R) => Promise<T>,
  ): Promise<T> {
    return this.entityManager.transaction(async (manager) => {
      const repositories = this.createRepositories(manager);
      return operation(repositories);
    });
  }

  protected abstract createRepositories(manager: EntityManager): R;
}
