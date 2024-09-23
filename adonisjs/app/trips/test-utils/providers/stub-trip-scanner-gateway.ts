import { type TripScannerGateway } from '#trips/core/ports/providers/trip-scanner-gateway'
import { type TripZone } from '#trips/core/structures/trip-zone'

export class StubTripScannerGateway implements TripScannerGateway {
  private locationZone: Record<string, TripZone> = {}
  private distance: Record<string, number> = {}

  async retrieveTripRouteInfo(startLocation: string, endLocation: string) {
    return {
      startZone: this.locationZone[startLocation],
      endZone: this.locationZone[endLocation],
      distanceKm: this.distance[this.tripKey(startLocation, endLocation)] || 0,
    }
  }

  setTripZone(location: string, zone: TripZone) {
    this.locationZone[location] = zone
  }

  setDistance(startLocation: string, endLocation: string, distance: number) {
    this.distance[this.tripKey(startLocation, endLocation)] = distance
  }

  private tripKey(startLocation: string, endLocation: string) {
    return startLocation + '|' + endLocation
  }
}
