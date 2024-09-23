export const TRIP_STATUSES = ['BOOKED', 'CONFIRMED', 'TERMINATED', 'CANCELLED'] as const

export type TripStatus = (typeof TRIP_STATUSES)[number]
