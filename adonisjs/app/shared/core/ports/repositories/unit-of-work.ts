export type UnitOfWork<R> = {
  execute: <T>(operation: (repositories: R) => Promise<T>) => Promise<T>

  executeInTransaction: <T>(operation: (repositories: R) => Promise<T>) => Promise<T>
}
