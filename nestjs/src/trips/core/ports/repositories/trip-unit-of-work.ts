import { type DomainEventOutbox } from '../../../../shared/core/ports/repositories/domain-event-outbox';
import { type UnitOfWork } from '../../../../shared/core/ports/repositories/unit-of-work';
import { type TripDomainEvent } from '../../events/trip-domain-event';
import { type RiderRepository } from './rider-repository';
import { type TripRepository } from './trip-repository';

export type TripUnitOfWorkRepositories = {
  domainEventOutbox: DomainEventOutbox<TripDomainEvent>;
  tripRepository: TripRepository;
  riderRepository: RiderRepository;
};

export type TripUnitOfWork = UnitOfWork<TripUnitOfWorkRepositories>;
