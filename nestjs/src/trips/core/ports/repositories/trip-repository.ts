import { type Trip } from '../../structures/trip';
import { type TripStatus } from '../../structures/trip-status';

export type TripRepository = {
  findById(id: string): Promise<Trip | null>;
  getRiderTripCountByStatus(
    riderId: string,
  ): Promise<Partial<Record<TripStatus, number>>>;
  getRiderTripCountSince(riderId: string, startDateTime: Date): Promise<number>;
  insert(trip: Trip): Promise<void>;
  update(trip: Trip): Promise<void>;
};
