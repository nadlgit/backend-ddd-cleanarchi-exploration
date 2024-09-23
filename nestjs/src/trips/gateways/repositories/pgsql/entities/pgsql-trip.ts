import { Column, Entity, PrimaryColumn } from 'typeorm';
import { type CarCategory } from '../../../../../shared/core/structures/car-category';
import { type TripStatus } from '../../../../core/structures/trip-status';

@Entity('trips')
export class PgSqlTrip {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id!: string;

  @Column({ name: 'rider_id', type: 'uuid' })
  riderId!: string;

  @Column({ name: 'start_location' })
  startLocation!: string;

  @Column({ name: 'end_location' })
  endLocation!: string;

  @Column({ name: 'bookedOn', type: 'timestamptz' })
  bookedOn!: Date;

  @Column({ name: 'car_category' })
  carCategory!: CarCategory;

  @Column({
    name: 'price',
    type: 'numeric',
    precision: 8,
    scale: 2,
    transformer: {
      from(value: string): number {
        return Number.parseFloat(value);
      },
      to(value: number): string {
        return value.toFixed(2);
      },
    },
  })
  price!: number;

  @Column({ name: 'driver_id', type: 'uuid', nullable: true })
  driverId!: string | null;

  @Column({ name: 'status' })
  status!: TripStatus;
}
