import { type TripBooked } from './trip-booked';
import { type TripConfirmed } from './trip-confirmed';

export type TripDomainEvent = TripBooked | TripConfirmed;
