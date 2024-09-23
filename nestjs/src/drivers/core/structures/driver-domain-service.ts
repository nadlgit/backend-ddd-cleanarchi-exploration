import { DomainEventService } from '../../../shared/core/events/domain-event-service';
import { type EventPublisher } from '../../../shared/core/ports/providers/event-publisher';
import { type DriverDomainEvent } from '../events/driver-domain-event';
import {
  type DriverUnitOfWork,
  type DriverUnitOfWorkRepositories,
} from '../ports/repositories/driver-unit-of-work';

export type DriverDomainService = DomainEventService<
  DriverDomainEvent,
  DriverUnitOfWorkRepositories
>;

export function createDriverDomainService({
  unitOfWork,
  eventPublisher,
}: {
  unitOfWork: DriverUnitOfWork;
  eventPublisher: EventPublisher;
}): DriverDomainService {
  return new DomainEventService(unitOfWork, eventPublisher);
}
