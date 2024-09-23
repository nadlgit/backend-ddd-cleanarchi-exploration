import { DomainEventService } from '#shared/core/events/domain-event-service'
import { type TripDomainEvent } from '#trips/core/events/trip-domain-event'
import { type TripUnitOfWorkRepositories } from '#trips/core/ports/repositories/trip-unit-of-work'

export class TripDomainService extends DomainEventService<
  TripDomainEvent,
  TripUnitOfWorkRepositories
> {}
