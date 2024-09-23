export const TRIP_ZONES = ['PARIS', 'OUTSIDE'] as const;

export type TripZone = (typeof TRIP_ZONES)[number];
