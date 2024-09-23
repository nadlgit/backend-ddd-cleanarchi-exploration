import { type QueryClientContract } from '@adonisjs/lucid/types/database'
import { type RiderRepository } from '#trips/core/ports/repositories/rider-repository'
import { Rider } from '#trips/core/structures/rider'
import PgSqlRider from '#trips/gateways/repositories/pgsql/models/pgsql-rider'

export class PgSqlRiderRepository implements RiderRepository {
  constructor(private readonly queryClient: QueryClientContract) {}

  async findById(id: string): Promise<Rider | null> {
    const dbRider = await PgSqlRider.findBy({ id }, { client: this.queryClient })
    if (dbRider) {
      return Rider.fromSnapshot({ id, birthDate: dbRider.birthDate, plan: dbRider.plan })
    }
    return null
  }

  async update(rider: Rider) {
    const snapshot = rider.toSnapshot()
    await PgSqlRider.updateOrCreate({ id: snapshot.id }, snapshot, { client: this.queryClient })
  }
}
