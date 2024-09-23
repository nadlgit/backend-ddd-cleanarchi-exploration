import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('driver_domain_events')
export class PgSqlDriverDomainEvent {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id!: string;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ name: 'type' })
  type!: string;

  @Column({ name: 'data', type: 'json' })
  data!: unknown;

  @Column({ name: 'status' })
  status!: 'PENDING' | 'PROCESSED';
}
