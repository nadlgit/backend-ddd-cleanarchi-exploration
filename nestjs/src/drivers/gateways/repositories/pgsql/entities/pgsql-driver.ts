import { Column, Entity, PrimaryColumn } from 'typeorm';
import { type CarCategory } from '../../../../../shared/core/structures/car-category';

@Entity('drivers')
export class PgSqlDriver {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id!: string;

  @Column({ name: 'name' })
  name!: string;

  @Column({ name: 'car_category' })
  carCategory!: CarCategory;

  @Column({ name: 'is_available', type: 'boolean' })
  isAvailable!: boolean;

  @Column({ name: 'location', type: 'text', nullable: true })
  location!: string | null;

  @Column({ name: 'current_trip_id', type: 'uuid', nullable: true })
  currentTripId!: string | null;
}
