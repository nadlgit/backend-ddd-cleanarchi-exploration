import { type DomainEventOutbox } from '#shared/core/ports/repositories/domain-event-outbox'
import { type UnitOfWork } from '#shared/core/ports/repositories/unit-of-work'
import { type TripDomainEvent } from '#trips/core/events/trip-domain-event'
import { type RiderRepository } from '#trips/core/ports/repositories/rider-repository'
import { type TripRepository } from '#trips/core/ports/repositories/trip-repository'

export type TripUnitOfWorkRepositories = {
  domainEventOutbox: DomainEventOutbox<TripDomainEvent>
  tripRepository: TripRepository
  riderRepository: RiderRepository
}

export abstract class TripUnitOfWork implements UnitOfWork<TripUnitOfWorkRepositories> {
  abstract execute: <T>(
    operation: (repositories: TripUnitOfWorkRepositories) => Promise<T>
  ) => Promise<T>
  abstract executeInTransaction: <T>(
    operation: (repositories: TripUnitOfWorkRepositories) => Promise<T>
  ) => Promise<T>
}
