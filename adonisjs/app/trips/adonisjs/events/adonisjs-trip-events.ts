import { type TripBooked } from '#trips/core/events/trip-booked'
import { type TripConfirmed } from '#trips/core/events/trip-confirmed'

declare module '@adonisjs/core/types' {
  interface EventsList {
    TRIP_BOOKED: TripBooked
    TRIP_CONFIRMED: TripConfirmed
  }
}
