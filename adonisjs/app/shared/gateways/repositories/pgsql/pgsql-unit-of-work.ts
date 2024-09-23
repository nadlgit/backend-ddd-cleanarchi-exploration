import { type QueryClientContract } from '@adonisjs/lucid/types/database'
import { type UnitOfWork } from '#shared/core/ports/repositories/unit-of-work'

export abstract class PgSqlUnitOfWork<R> implements UnitOfWork<R> {
  private readonly _repositories: R

  constructor(private readonly queryClient: QueryClientContract) {
    this._repositories = this.createRepositories(queryClient)
  }

  async execute<T>(operation: (repositories: R) => Promise<T>): Promise<T> {
    return operation(this._repositories)
  }

  async executeInTransaction<T>(operation: (repositories: R) => Promise<T>): Promise<T> {
    return this.queryClient.transaction(async (trx) => {
      const repositories = this.createRepositories(trx)
      return operation(repositories)
    })
  }

  protected abstract createRepositories(client: QueryClientContract): R
}
