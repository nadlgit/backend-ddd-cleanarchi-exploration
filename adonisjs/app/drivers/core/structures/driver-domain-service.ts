import { type DriverDomainEvent } from '#drivers/core/events/driver-domain-event'
import { type DriverUnitOfWorkRepositories } from '#drivers/core/ports/repositories/driver-unit-of-work'
import { DomainEventService } from '#shared/core/events/domain-event-service'

export class DriverDomainService extends DomainEventService<
  DriverDomainEvent,
  DriverUnitOfWorkRepositories
> {}
