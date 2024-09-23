export abstract class LocationDistanceGateway {
  abstract getDistanceInKm: (origin: string, destination: string) => Promise<number>
}
