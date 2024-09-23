import { type AppEventBuffer } from '../../../shared/core/events/app-event-buffer';
import { type DateProvider } from '../../../shared/core/ports/providers/date-provider';
import { type IdProvider } from '../../../shared/core/ports/providers/id-provider';
import { type CarCategory } from '../../../shared/core/structures/car-category';
import { type DriverDomainEvent } from '../events/driver-domain-event';
import { DriverMatched } from '../events/driver-matched';
import { type LocationDistanceGateway } from '../ports/providers/location-distance-gateway';

export class Driver implements AppEventBuffer<DriverDomainEvent> {
  private events: DriverDomainEvent[] = [];

  private constructor(
    private readonly id: string,
    private name: string,
    private carCategory: CarCategory,
    private isAvailable: boolean,
    private location: string | null,
    private currentTripId: string | null,
  ) {
    // NB: Constructor or factory should check invariants to ensure valid entity
  }

  async isBookedTripEligible({
    tripStartLocation,
    locationDistanceGateway,
    carCategory,
  }: IsBookedTripEligibleInfo): Promise<boolean> {
    if (!this.location) {
      return false;
    }
    const distanceKm = await locationDistanceGateway.getDistanceInKm(
      this.location,
      tripStartLocation,
    );
    return distanceKm <= 5 && this.carCategory === carCategory;
  }

  acceptBookedTrip({ tripId, idProvider, dateProvider }: AcceptTripInfo): void {
    this.isAvailable = false;
    this.currentTripId = tripId;
    this.addEvent(
      new DriverMatched({
        id: idProvider.generate(),
        occurredAt: dateProvider.currentDateTime(),
        data: { driverId: this.id, tripId },
      }),
    );
  }

  toSnapshot(): DriverSnapshot {
    return {
      id: this.id,
      name: this.name,
      carCategory: this.carCategory,
      isAvailable: this.isAvailable,
      location: this.location,
      currentTripId: this.currentTripId,
    };
  }

  static fromSnapshot(snapshot: DriverSnapshot): Driver {
    return new Driver(
      snapshot.id,
      snapshot.name,
      snapshot.carCategory,
      snapshot.isAvailable,
      snapshot.location,
      snapshot.currentTripId,
    );
  }

  getEvents() {
    return structuredClone(this.events);
  }

  clearEvents() {
    this.events = [];
  }

  private addEvent(event: DriverDomainEvent) {
    this.events.push(event);
  }
}

export type DriverSnapshot = {
  id: string;
  name: string;
  carCategory: CarCategory;
  isAvailable: boolean;
  location: string | null;
  currentTripId: string | null;
};

type IsBookedTripEligibleInfo = {
  tripStartLocation: string;
  locationDistanceGateway: LocationDistanceGateway;
  carCategory: CarCategory;
};

type AcceptTripInfo = {
  tripId: string;
  idProvider: IdProvider;
  dateProvider: DateProvider;
};
