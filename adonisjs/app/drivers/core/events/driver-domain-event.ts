import { type DriverMatched } from '#drivers/core/events/driver-matched'
import { type NoDriverAvailable } from '#drivers/core/events/no-driver-available'

export type DriverDomainEvent = DriverMatched | NoDriverAvailable
