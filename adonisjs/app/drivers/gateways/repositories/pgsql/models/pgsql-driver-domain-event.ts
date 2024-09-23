import { PgSqlAppEvent } from '#shared/gateways/repositories/pgsql/pgsql-app-event'

export default class PgSqlDriverDomainEvent extends PgSqlAppEvent {
  static table = 'driver_domain_events'
}
