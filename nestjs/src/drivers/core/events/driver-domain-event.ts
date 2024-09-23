import { type DriverMatched } from './driver-matched';
import { type NoDriverAvailable } from './no-driver-available';

export type DriverDomainEvent = DriverMatched | NoDriverAvailable;
