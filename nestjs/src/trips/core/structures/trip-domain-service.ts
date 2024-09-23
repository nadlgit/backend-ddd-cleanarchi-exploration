import { DomainEventService } from '../../../shared/core/events/domain-event-service';
import { type EventPublisher } from '../../../shared/core/ports/providers/event-publisher';
import { type TripDomainEvent } from '../events/trip-domain-event';
import {
  type TripUnitOfWork,
  type TripUnitOfWorkRepositories,
} from '../ports/repositories/trip-unit-of-work';

export type TripDomainService = DomainEventService<
  TripDomainEvent,
  TripUnitOfWorkRepositories
>;

export function createTripDomainService({
  unitOfWork,
  eventPublisher,
}: {
  unitOfWork: TripUnitOfWork;
  eventPublisher: EventPublisher;
}): TripDomainService {
  return new DomainEventService(unitOfWork, eventPublisher);
}
