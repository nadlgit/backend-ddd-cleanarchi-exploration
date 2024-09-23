import { Inject, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SharedModule } from '../../shared/nestjs/shared-module';
import {
  createDriverEventSubscription,
  type DriverEventSubscription,
} from '../core/listeners/driver-event-subscription';
import {
  createDriverDomainService,
  type DriverDomainService,
} from '../core/structures/driver-domain-service';
import { MatchDriverUseCase } from '../core/usecases/match-driver';
import { PgSqlDriverUnitOfWork } from '../gateways/repositories/pgsql/pgsql-driver-unit-of-work';

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [
    {
      provide: 'DriverUnitOfWork',
      inject: [DataSource],
      useFactory: (dataSource) => new PgSqlDriverUnitOfWork(dataSource.manager),
    },
    {
      provide: 'LocationDistanceGateway',
      useValue: {
        async getDistanceInKm() {
          return 1;
        },
      },
    },
    {
      provide: 'DriverDomainService',
      inject: ['DriverUnitOfWork', 'EventPublisher'],
      useFactory: (unitOfWork, eventPublisher) =>
        createDriverDomainService({ unitOfWork, eventPublisher }),
    },
    {
      provide: 'DriverEventSubscription',
      inject: [
        'EventSubscriptionManager',
        MatchDriverUseCase,
        'EventPublisher',
      ],
      useFactory: (eventManager, matchDriverUseCase, eventPublisher) =>
        createDriverEventSubscription({
          eventManager,
          matchDriverUseCase,
          eventPublisher,
        }),
    },
    {
      provide: MatchDriverUseCase,
      inject: [
        'DriverUnitOfWork',
        'LocationDistanceGateway',
        'IdProvider',
        'DateProvider',
      ],
      useFactory: (
        unitOfWork,
        locationDistanceGateway,
        idProvider,
        dateProvider,
      ) =>
        new MatchDriverUseCase(
          unitOfWork,
          locationDistanceGateway,
          idProvider,
          dateProvider,
        ),
    },
  ],
})
export class DriverModule {
  constructor(
    @Inject('DriverDomainService')
    private readonly driverDomainEventService: DriverDomainService,
    @Inject('DriverEventSubscription')
    private readonly driverEventSubscription: DriverEventSubscription,
  ) {}

  onModuleInit() {
    this.driverDomainEventService.startPollingEvents();
    this.driverEventSubscription.registerAllListeners();
  }

  onModuleDestroy() {
    this.driverDomainEventService.stopPollingEvents();
    this.driverEventSubscription.unregisterAllListeners();
  }
}
