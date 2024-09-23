import { InMemoryDomainEventOutbox } from '#shared/gateways/repositories/inmemory-domain-event-outbox'
import { InMemoryUnitOfWork } from '#shared/gateways/repositories/inmemory-unit-of-work'
import { type TripDomainEvent } from '#trips/core/events/trip-domain-event'
import {
  type TripUnitOfWork,
  type TripUnitOfWorkRepositories,
} from '#trips/core/ports/repositories/trip-unit-of-work'
import { InMemoryRiderRepository } from '#trips/gateways/repositories/inmemory-rider-repository'
import { InMemoryTripRepository } from '#trips/gateways/repositories/inmemory-trip-repository'

export class InMemoryTripUnitOfWork
  extends InMemoryUnitOfWork<TripUnitOfWorkRepositories>
  implements TripUnitOfWork
{
  constructor(
    domainEventOutbox: InMemoryDomainEventOutbox<TripDomainEvent>,
    tripRepository: InMemoryTripRepository,
    riderRepository: InMemoryRiderRepository
  ) {
    super({ domainEventOutbox, tripRepository, riderRepository })
    this.getOutboxMessages = () => domainEventOutbox.messages
    this.getTripSnapshots = () => tripRepository.tripSnapshots
    this.getRiderSnapshots = () => riderRepository.riderSnapshots
  }

  readonly getOutboxMessages: () => InMemoryDomainEventOutbox<TripDomainEvent>['messages']

  readonly getTripSnapshots: () => InMemoryTripRepository['tripSnapshots']

  readonly getRiderSnapshots: () => InMemoryRiderRepository['riderSnapshots']
}
