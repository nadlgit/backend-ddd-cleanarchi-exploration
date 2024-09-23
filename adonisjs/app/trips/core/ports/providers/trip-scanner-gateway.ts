import { type TripZone } from '#trips/core/structures/trip-zone'

type TripRouteInfo = {
  startZone: TripZone
  endZone: TripZone
  distanceKm: number
}

export abstract class TripScannerGateway {
  abstract retrieveTripRouteInfo: (
    startLocation: string,
    endLocation: string
  ) => Promise<TripRouteInfo>
}
