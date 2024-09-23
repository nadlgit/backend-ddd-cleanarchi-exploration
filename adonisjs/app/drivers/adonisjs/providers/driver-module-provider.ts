import { type ApplicationService } from '@adonisjs/core/types'
import {
  createDriverEventSubscription,
  DriverEventSubscription,
} from '#drivers/core/listeners/driver-event-subscription'
import { LocationDistanceGateway } from '#drivers/core/ports/providers/location-distance-gateway'
import { DriverUnitOfWork } from '#drivers/core/ports/repositories/driver-unit-of-work'
import { DriverDomainService } from '#drivers/core/structures/driver-domain-service'
import { DateProvider } from '#shared/core/ports/providers/date-provider'
import { EventPublisher } from '#shared/core/ports/providers/event-publisher'
import { EventSubscriptionManager } from '#shared/core/ports/providers/event-subscription-manager'
import { IdProvider } from '#shared/core/ports/providers/id-provider'

export default class DriverModuleProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    this.app.container.bind(DriverUnitOfWork, async (resolver) => {
      const queryClient = await resolver.make('QueryClientContract')
      const { PgSqlDriverUnitOfWork } = await import(
        '#drivers/gateways/repositories/pgsql/pgsql-driver-unit-of-work'
      )
      return new PgSqlDriverUnitOfWork(queryClient)
    })

    this.app.container.bindValue(LocationDistanceGateway, {
      async getDistanceInKm() {
        return 1
      },
    })

    this.app.container.singleton(DriverDomainService, async (resolver) => {
      const [unitOfWork, eventPublisher] = await Promise.all([
        resolver.make(DriverUnitOfWork),
        resolver.make(EventPublisher),
      ])
      return new DriverDomainService(unitOfWork, eventPublisher)
    })

    this.app.container.singleton(DriverEventSubscription, async (resolver) => {
      const [eventManager, matchDriverUseCase, eventPublisher] = await Promise.all([
        resolver.make(EventSubscriptionManager),
        resolver.make(MatchDriverUseCase),
        resolver.make(EventPublisher),
      ])
      return createDriverEventSubscription({ eventManager, matchDriverUseCase, eventPublisher })
    })

    const { MatchDriverUseCase } = await import('#drivers/core/usecases/match-driver')
    this.app.container.bind(MatchDriverUseCase, async (resolver) => {
      const [unitOfWork, locationDistanceGateway, idProvider, dateProvider] = await Promise.all([
        resolver.make(DriverUnitOfWork),
        resolver.make(LocationDistanceGateway),
        resolver.make(IdProvider),
        resolver.make(DateProvider),
      ])
      return new MatchDriverUseCase(unitOfWork, locationDistanceGateway, idProvider, dateProvider)
    })
  }

  async start() {
    const [driverDomainEventService, driverEventSubscription] = await Promise.all([
      this.app.container.make(DriverDomainService),
      this.app.container.make(DriverEventSubscription),
    ])
    driverEventSubscription.registerAllListeners()
    driverDomainEventService.startPollingEvents()
  }

  async shutdown() {
    const [driverDomainEventService, driverEventSubscription] = await Promise.all([
      this.app.container.make(DriverDomainService),
      this.app.container.make(DriverEventSubscription),
    ])
    driverDomainEventService.stopPollingEvents()
    driverEventSubscription.unregisterAllListeners()
  }
}
