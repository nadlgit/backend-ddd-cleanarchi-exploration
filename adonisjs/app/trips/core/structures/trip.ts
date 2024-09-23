import { type AppEventBuffer } from '#shared/core/events/app-event-buffer'
import { type DateProvider } from '#shared/core/ports/providers/date-provider'
import { type IdProvider } from '#shared/core/ports/providers/id-provider'
import { type CarCategory } from '#shared/core/structures/car-category'
import { TripBooked } from '#trips/core/events/trip-booked'
import { TripConfirmed } from '#trips/core/events/trip-confirmed'
import { type TripDomainEvent } from '#trips/core/events/trip-domain-event'
import { UberXShortTripException } from '#trips/core/exceptions/uberx-short-trip-exception'
import { type TripStatus } from '#trips/core/structures/trip-status'
import { type TripZone } from '#trips/core/structures/trip-zone'

export class Trip implements AppEventBuffer<TripDomainEvent> {
  private events: TripDomainEvent[] = []

  private constructor(
    private readonly id: string,
    private readonly riderId: string,
    private readonly startLocation: string,
    private readonly endLocation: string,
    private readonly bookedOn: Date,
    private carCategory: CarCategory,
    private price: number,
    private driverId: string | null,
    private status: TripStatus
  ) {}

  static book({
    id,
    riderId,
    isRiderBirthday,
    startLocation,
    endLocation,
    startZone,
    endZone,
    distanceKm,
    carCategory,
    idProvider,
    dateProvider,
  }: BookTripInfo): Trip {
    Trip.assertEligibleToRequestedCarCategory(carCategory, distanceKm)
    const trip = new Trip(
      id,
      riderId,
      startLocation,
      endLocation,
      dateProvider.currentDateTime(),
      carCategory,
      Trip.makePrice(startZone, endZone, distanceKm, carCategory, isRiderBirthday),
      null,
      'BOOKED'
    )
    trip.addEvent(
      new TripBooked({
        id: idProvider.generate(),
        occurredAt: trip.bookedOn,
        data: { tripId: trip.id },
      })
    )
    return trip
  }

  confirm({ driverId, idProvider, dateProvider }: ConfirmTripInfo) {
    this.driverId = driverId
    this.status = 'CONFIRMED'
    this.addEvent(
      new TripConfirmed({
        id: idProvider.generate(),
        occurredAt: dateProvider.currentDateTime(),
        data: { tripId: this.id },
      })
    )
  }

  toSnapshot(): TripSnapshot {
    return {
      id: this.id,
      riderId: this.riderId,
      startLocation: this.startLocation,
      endLocation: this.endLocation,
      bookedOn: this.bookedOn,
      carCategory: this.carCategory,
      price: this.price,
      driverId: this.driverId,
      status: this.status,
    }
  }

  static fromSnapshot(snapshot: TripSnapshot): Trip {
    return new Trip(
      snapshot.id,
      snapshot.riderId,
      snapshot.startLocation,
      snapshot.endLocation,
      snapshot.bookedOn,
      snapshot.carCategory,
      snapshot.price,
      snapshot.driverId,
      snapshot.status
    )
  }

  getEvents() {
    return structuredClone(this.events)
  }

  clearEvents() {
    this.events = []
  }

  private addEvent(event: TripDomainEvent) {
    this.events.push(event)
  }

  private static assertEligibleToRequestedCarCategory(
    carCategory: CarCategory,
    distanceKm: number
  ) {
    if (carCategory === 'UBERX' && distanceKm < 3) {
      throw new UberXShortTripException()
    }
  }

  private static makePrice(
    startZone: TripZone,
    endZone: TripZone,
    distanceKm: number,
    carCategory: CarCategory,
    isRiderBirthday: boolean
  ) {
    const zoneFees =
      {
        PARIS: { PARIS: 30, OUTSIDE: 20 },
        OUTSIDE: { PARIS: 50, OUTSIDE: 100 },
      }[startZone]?.[endZone] ?? 0
    const distanceFees = 0.5 * Math.ceil(distanceKm)
    const uberxFees = carCategory === 'UBERX' && !isRiderBirthday ? 10 : 0
    return zoneFees + distanceFees + uberxFees
  }
}

export type TripSnapshot = {
  id: string
  riderId: string
  startLocation: string
  endLocation: string
  bookedOn: Date
  carCategory: CarCategory
  price: number
  driverId: string | null
  status: TripStatus
}

type BookTripInfo = {
  id: string
  riderId: string
  isRiderBirthday: boolean
  startLocation: string
  endLocation: string
  startZone: TripZone
  endZone: TripZone
  distanceKm: number
  carCategory: CarCategory
  idProvider: IdProvider
  dateProvider: DateProvider
}

type ConfirmTripInfo = {
  driverId: string
  idProvider: IdProvider
  dateProvider: DateProvider
}
