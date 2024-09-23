import { InMemoryDomainEventOutbox } from '../../../shared/gateways/repositories/inmemory-domain-event-outbox';
import { InMemoryUnitOfWork } from '../../../shared/gateways/repositories/inmemory-unit-of-work';
import { type DriverDomainEvent } from '../../core/events/driver-domain-event';
import {
  type DriverUnitOfWork,
  type DriverUnitOfWorkRepositories,
} from '../../core/ports/repositories/driver-unit-of-work';
import { InMemoryDriverRepository } from './inmemory-driver-repository';

export class InMemoryDriverUnitOfWork
  extends InMemoryUnitOfWork<DriverUnitOfWorkRepositories>
  implements DriverUnitOfWork
{
  constructor(
    domainEventOutbox: InMemoryDomainEventOutbox<DriverDomainEvent>,
    driverRepository: InMemoryDriverRepository,
  ) {
    super({ domainEventOutbox, driverRepository });
    this.getOutboxMessages = () => domainEventOutbox.messages;
    this.getDriverSnapshots = () => driverRepository.driverSnapshots;
  }

  readonly getOutboxMessages: () => InMemoryDomainEventOutbox<DriverDomainEvent>['messages'];

  readonly getDriverSnapshots: () => InMemoryDriverRepository['driverSnapshots'];
}
