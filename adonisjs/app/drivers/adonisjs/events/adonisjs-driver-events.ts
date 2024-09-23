import { type DriverMatched } from '#drivers/core/events/driver-matched'
import { type NoDriverAvailable } from '#drivers/core/events/no-driver-available'

declare module '@adonisjs/core/types' {
  interface EventsList {
    DRIVER_MATCHED: DriverMatched
    NO_DRIVER_AVAILABLE: NoDriverAvailable
  }
}
