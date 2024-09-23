import { PgSqlAppEvent } from '#shared/gateways/repositories/pgsql/pgsql-app-event'

export default class PgSqlTripDomainEvent extends PgSqlAppEvent {
  static table = 'trip_domain_events'
}
