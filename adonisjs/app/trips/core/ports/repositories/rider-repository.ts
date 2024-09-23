import { type Rider } from '#trips/core/structures/rider'

export abstract class RiderRepository {
  abstract findById(id: string): Promise<Rider | null>
  abstract update(rider: Rider): Promise<void>
}
