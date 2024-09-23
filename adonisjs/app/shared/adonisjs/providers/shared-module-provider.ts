import { type ApplicationService } from '@adonisjs/core/types'
import { type QueryClientContract } from '@adonisjs/lucid/types/database'
import { DateProvider } from '#shared/core/ports/providers/date-provider'
import { EventPublisher } from '#shared/core/ports/providers/event-publisher'
import { EventSubscriptionManager } from '#shared/core/ports/providers/event-subscription-manager'
import { IdProvider } from '#shared/core/ports/providers/id-provider'
import { SystemDateProvider } from '#shared/gateways/providers/system-date-provider'
import { RandomIdProvider } from '#shared/gateways/providers/random-id-provider'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    QueryClientContract: QueryClientContract
  }
}

export default class SharedModuleProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    this.app.container.bind(IdProvider, () => this.app.container.make(RandomIdProvider))

    this.app.container.bind(DateProvider, () => this.app.container.make(SystemDateProvider))

    this.app.container.bind('QueryClientContract', async (resolver) => {
      const db = await resolver.make('lucid.db')
      return db.connection()
    })

    const { AdonisJsEventPublisher, AdonisJsEventSubscriptionManager } = await import(
      '#shared/gateways/providers/adonisjs-event-providers'
    )
    this.app.container.bind(EventPublisher, () => this.app.container.make(AdonisJsEventPublisher))
    this.app.container.bind(EventSubscriptionManager, () =>
      this.app.container.make(AdonisJsEventSubscriptionManager)
    )
  }
}
