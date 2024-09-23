import { Column, Entity, PrimaryColumn } from 'typeorm';
import { type RiderPlan } from '../../../../core/structures/rider-plan';

@Entity('riders')
export class PgSqlRider {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id!: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate!: string;

  @Column({ name: 'plan' })
  plan!: RiderPlan;
}
