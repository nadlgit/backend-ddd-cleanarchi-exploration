import { type ExternalDriverMatched } from '#shared/core/events/external-driver-matched'
import { type ExternalNoDriverAvailable } from '#shared/core/events/external-no-driver-available'
import { type ExternalTripBooked } from '#shared/core/events/external-trip-booked'

declare module '@adonisjs/core/types' {
  interface EventsList {
    EXT_DRIVER_MATCHED: ExternalDriverMatched
    EXT_NO_DRIVER_AVAILABLE: ExternalNoDriverAvailable
    EXT_TRIP_BOOKED: ExternalTripBooked
  }
}
