import { type DomainEventOutbox } from '../../../../shared/core/ports/repositories/domain-event-outbox';
import { type UnitOfWork } from '../../../../shared/core/ports/repositories/unit-of-work';
import { type DriverDomainEvent } from '../../events/driver-domain-event';
import { type DriverRepository } from './driver-repository';

export type DriverUnitOfWorkRepositories = {
  domainEventOutbox: DomainEventOutbox<DriverDomainEvent>;
  driverRepository: DriverRepository;
};

export type DriverUnitOfWork = UnitOfWork<DriverUnitOfWorkRepositories>;
