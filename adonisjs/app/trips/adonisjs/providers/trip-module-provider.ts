import { type ApplicationService } from '@adonisjs/core/types'
import { DateProvider } from '#shared/core/ports/providers/date-provider'
import { EventPublisher } from '#shared/core/ports/providers/event-publisher'
import { EventSubscriptionManager } from '#shared/core/ports/providers/event-subscription-manager'
import { IdProvider } from '#shared/core/ports/providers/id-provider'
import {
  createTripEventSubscription,
  TripEventSubscription,
} from '#trips/core/listeners/trip-event-subscription'
import { TripScannerGateway } from '#trips/core/ports/providers/trip-scanner-gateway'
import { GetRiderTripHistoryQuery } from '#trips/core/ports/queries/get-rider-trip-history-query'
import { TripUnitOfWork } from '#trips/core/ports/repositories/trip-unit-of-work'
import { TripDomainService } from '#trips/core/structures/trip-domain-service'

export default class TripModuleProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    this.app.container.bind(TripUnitOfWork, async (resolver) => {
      const queryClient = await resolver.make('QueryClientContract')
      const { PgSqlTripUnitOfWork } = await import(
        '#trips/gateways/repositories/pgsql/pgsql-trip-unit-of-work'
      )
      return new PgSqlTripUnitOfWork(queryClient)
    })

    this.app.container.bind(GetRiderTripHistoryQuery, async (resolver) => {
      const queryClient = await resolver.make('QueryClientContract')
      const { PgSqlGetRiderTripHistoryQuery } = await import(
        '#trips/gateways/queries/pgsql-get-rider-trip-history-query'
      )
      return new PgSqlGetRiderTripHistoryQuery(queryClient)
    })

    this.app.container.bindValue(TripScannerGateway, {
      async retrieveTripRouteInfo(startLocation: string, endLocation: string) {
        return {
          startZone: startLocation.toUpperCase().includes('PARIS') ? 'PARIS' : 'OUTSIDE',
          endZone: endLocation.toUpperCase().includes('PARIS') ? 'PARIS' : 'OUTSIDE',
          distanceKm: 1,
        }
      },
    })

    this.app.container.singleton(TripDomainService, async (resolver) => {
      const [unitOfWork, eventPublisher] = await Promise.all([
        resolver.make(TripUnitOfWork),
        resolver.make(EventPublisher),
      ])
      return new TripDomainService(unitOfWork, eventPublisher)
    })

    this.app.container.singleton(TripEventSubscription, async (resolver) => {
      const [eventManager, eventPublisher, unitOfWork, confirmTripUseCase] = await Promise.all([
        resolver.make(EventSubscriptionManager),
        resolver.make(EventPublisher),
        resolver.make(TripUnitOfWork),
        resolver.make(ConfirmTripUseCase),
      ])
      return createTripEventSubscription({
        eventManager,
        eventPublisher,
        unitOfWork,
        confirmTripUseCase,
      })
    })

    const { BookTripUseCase } = await import('#trips/core/usecases/book-trip')
    this.app.container.bind(BookTripUseCase, async (resolver) => {
      const [unitOfWork, tripScannerGateway, idProvider, dateProvider] = await Promise.all([
        resolver.make(TripUnitOfWork),
        resolver.make(TripScannerGateway),
        resolver.make(IdProvider),
        resolver.make(DateProvider),
      ])
      return new BookTripUseCase(unitOfWork, tripScannerGateway, idProvider, dateProvider)
    })

    const { ConfirmTripUseCase } = await import('#trips/core/usecases/confirm-trip')
    this.app.container.bind(ConfirmTripUseCase, async (resolver) => {
      const [unitOfWork, idProvider, dateProvider] = await Promise.all([
        resolver.make(TripUnitOfWork),
        resolver.make(IdProvider),
        resolver.make(DateProvider),
      ])
      return new ConfirmTripUseCase(unitOfWork, idProvider, dateProvider)
    })
  }

  async start() {
    const [tripDomainEventService, tripEventSubscription] = await Promise.all([
      this.app.container.make(TripDomainService),
      this.app.container.make(TripEventSubscription),
    ])
    tripEventSubscription.registerAllListeners()
    tripDomainEventService.startPollingEvents()
  }

  async shutdown() {
    const [tripDomainEventService, tripEventSubscription] = await Promise.all([
      this.app.container.make(TripDomainService),
      this.app.container.make(TripEventSubscription),
    ])
    tripDomainEventService.stopPollingEvents()
    tripEventSubscription.unregisterAllListeners()
  }
}
