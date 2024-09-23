import { type DriverDomainEvent } from '#drivers/core/events/driver-domain-event'
import { type DriverRepository } from '#drivers/core/ports/repositories/driver-repository'
import { type DomainEventOutbox } from '#shared/core/ports/repositories/domain-event-outbox'
import { type UnitOfWork } from '#shared/core/ports/repositories/unit-of-work'

export type DriverUnitOfWorkRepositories = {
  domainEventOutbox: DomainEventOutbox<DriverDomainEvent>
  driverRepository: DriverRepository
}

export abstract class DriverUnitOfWork implements UnitOfWork<DriverUnitOfWorkRepositories> {
  abstract execute: <T>(
    operation: (repositories: DriverUnitOfWorkRepositories) => Promise<T>
  ) => Promise<T>
  abstract executeInTransaction: <T>(
    operation: (repositories: DriverUnitOfWorkRepositories) => Promise<T>
  ) => Promise<T>
}
