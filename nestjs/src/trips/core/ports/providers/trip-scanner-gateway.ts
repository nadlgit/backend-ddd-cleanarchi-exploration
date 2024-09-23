import { type TripZone } from '../../structures/trip-zone';

type TripRouteInfo = {
  startZone: TripZone;
  endZone: TripZone;
  distanceKm: number;
};

export type TripScannerGateway = {
  retrieveTripRouteInfo: (
    startLocation: string,
    endLocation: string,
  ) => Promise<TripRouteInfo>;
};
