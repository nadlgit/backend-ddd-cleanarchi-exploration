import { type EntityManager } from 'typeorm';
import { type RiderRepository } from '../../../core/ports/repositories/rider-repository';
import { Rider } from '../../../core/structures/rider';
import { PgSqlRider } from './entities/pgsql-rider';

export class PgSqlRiderRepository implements RiderRepository {
  constructor(private readonly entityManager: EntityManager) {}

  async findById(id: string): Promise<Rider | null> {
    const dbRepository = this.entityManager.getRepository(PgSqlRider);
    const dbEntity = await dbRepository.findOneBy({ id });
    if (dbEntity) {
      const { id, birthDate, plan } = dbEntity;
      return Rider.fromSnapshot({ id, birthDate, plan });
    }
    return null;
  }

  async update(rider: Rider) {
    const { id, birthDate, plan } = rider.toSnapshot();
    const dbRepository = this.entityManager.getRepository(PgSqlRider);
    await dbRepository.save(dbRepository.create({ id, birthDate, plan }));
  }
}
