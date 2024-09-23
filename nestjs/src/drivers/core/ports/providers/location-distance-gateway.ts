export type LocationDistanceGateway = {
  getDistanceInKm: (origin: string, destination: string) => Promise<number>;
};
