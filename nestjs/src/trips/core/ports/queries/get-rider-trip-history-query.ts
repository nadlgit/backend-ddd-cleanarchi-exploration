import { type CarCategory } from '../../../../shared/core/structures/car-category';
import { type TripStatus } from '../../structures/trip-status';

export type GetRiderTripHistoryQuery = {
  execute(riderId: string): Promise<RiderTripHistory>;
};

export type RiderTripHistory = {
  riderId: string;
  trips: {
    tripId: string;
    startLocation: string;
    endLocation: string;
    bookedOn: Date;
    carCategory: CarCategory;
    price: number;
    driverId: string | null;
    status: TripStatus;
  }[];
};
