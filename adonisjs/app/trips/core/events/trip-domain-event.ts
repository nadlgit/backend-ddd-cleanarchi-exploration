import { type TripBooked } from '#trips/core/events/trip-booked'
import { type TripConfirmed } from '#trips/core/events/trip-confirmed'

export type TripDomainEvent = TripBooked | TripConfirmed
