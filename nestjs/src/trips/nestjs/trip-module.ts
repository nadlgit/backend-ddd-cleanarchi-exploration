import { Inject, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SharedModule } from '../../shared/nestjs/shared-module';
import {
  createTripEventSubscription,
  type TripEventSubscription,
} from '../core/listeners/trip-event-subscription';
import {
  createTripDomainService,
  type TripDomainService,
} from '../core/structures/trip-domain-service';
import { BookTripUseCase } from '../core/usecases/book-trip';
import { ConfirmTripUseCase } from '../core/usecases/confirm-trip';
import { PgSqlGetRiderTripHistoryQuery } from '../gateways/queries/pgsql-get-rider-trip-history-query';
import { PgSqlTripUnitOfWork } from '../gateways/repositories/pgsql/pgsql-trip-unit-of-work';
import { TripController } from './controllers/trip-controller';

@Module({
  imports: [SharedModule],
  controllers: [TripController],
  providers: [
    {
      provide: 'TripUnitOfWork',
      inject: [DataSource],
      useFactory: (dataSource) => new PgSqlTripUnitOfWork(dataSource.manager),
    },
    {
      provide: 'GetRiderTripHistoryQuery',
      inject: [DataSource],
      useFactory: (dataSource) =>
        new PgSqlGetRiderTripHistoryQuery(dataSource.manager),
    },
    {
      provide: 'TripScannerGateway',
      useValue: {
        async retrieveTripRouteInfo(
          startLocation: string,
          endLocation: string,
        ) {
          return {
            startZone: startLocation.toUpperCase().includes('PARIS')
              ? 'PARIS'
              : 'OUTSIDE',
            endZone: endLocation.toUpperCase().includes('PARIS')
              ? 'PARIS'
              : 'OUTSIDE',
            distanceKm: 1,
          };
        },
      },
    },
    {
      provide: 'TripDomainService',
      inject: ['TripUnitOfWork', 'EventPublisher'],
      useFactory: (unitOfWork, eventPublisher) =>
        createTripDomainService({ unitOfWork, eventPublisher }),
    },
    {
      provide: 'TripEventSubscription',
      inject: [
        'EventSubscriptionManager',
        'EventPublisher',
        'TripUnitOfWork',
        ConfirmTripUseCase,
      ],
      useFactory: (
        eventManager,
        eventPublisher,
        unitOfWork,
        confirmTripUseCase,
      ) =>
        createTripEventSubscription({
          eventManager,
          eventPublisher,
          unitOfWork,
          confirmTripUseCase,
        }),
    },
    {
      provide: BookTripUseCase,
      inject: [
        'TripUnitOfWork',
        'TripScannerGateway',
        'IdProvider',
        'DateProvider',
      ],
      useFactory: (unitOfWork, tripScannerGateway, idProvider, dateProvider) =>
        new BookTripUseCase(
          unitOfWork,
          tripScannerGateway,
          idProvider,
          dateProvider,
        ),
    },
    {
      provide: ConfirmTripUseCase,
      inject: ['TripUnitOfWork', 'IdProvider', 'DateProvider'],
      useFactory: (unitOfWork, idProvider, dateProvider) =>
        new ConfirmTripUseCase(unitOfWork, idProvider, dateProvider),
    },
  ],
})
export class TripModule {
  constructor(
    @Inject('TripDomainService')
    private readonly tripDomainEventService: TripDomainService,
    @Inject('TripEventSubscription')
    private readonly tripEventSubscription: TripEventSubscription,
  ) {}

  onModuleInit() {
    this.tripDomainEventService.startPollingEvents();
    this.tripEventSubscription.registerAllListeners();
  }

  onModuleDestroy() {
    this.tripDomainEventService.stopPollingEvents();
    this.tripEventSubscription.unregisterAllListeners();
  }
}
