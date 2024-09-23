import { type DriverDomainEvent } from '#drivers/core/events/driver-domain-event'
import {
  type DriverUnitOfWork,
  type DriverUnitOfWorkRepositories,
} from '#drivers/core/ports/repositories/driver-unit-of-work'
import { InMemoryDomainEventOutbox } from '#shared/gateways/repositories/inmemory-domain-event-outbox'
import { InMemoryDriverRepository } from '#drivers/gateways/repositories/inmemory-driver-repository'
import { InMemoryUnitOfWork } from '#shared/gateways/repositories/inmemory-unit-of-work'

export class InMemoryDriverUnitOfWork
  extends InMemoryUnitOfWork<DriverUnitOfWorkRepositories>
  implements DriverUnitOfWork
{
  constructor(
    domainEventOutbox: InMemoryDomainEventOutbox<DriverDomainEvent>,
    driverRepository: InMemoryDriverRepository
  ) {
    super({ domainEventOutbox, driverRepository })
    this.getOutboxMessages = () => domainEventOutbox.messages
    this.getDriverSnapshots = () => driverRepository.driverSnapshots
  }

  readonly getOutboxMessages: () => InMemoryDomainEventOutbox<DriverDomainEvent>['messages']

  readonly getDriverSnapshots: () => InMemoryDriverRepository['driverSnapshots']
}
