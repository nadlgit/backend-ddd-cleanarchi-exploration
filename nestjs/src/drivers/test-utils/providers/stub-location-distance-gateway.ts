import { type LocationDistanceGateway } from '../../core/ports/providers/location-distance-gateway';

export class StubLocationDistanceGateway implements LocationDistanceGateway {
  private distance: Record<string, number> = {};

  async getDistanceInKm(origin: string, destination: string) {
    return this.distance[this.locationKey(origin, destination)];
  }

  setDistance(origin: string, destination: string, distance: number) {
    this.distance[this.locationKey(origin, destination)] = distance;
  }

  private locationKey(origin: string, destination: string) {
    return origin + '|' + destination;
  }
}
