import { type Rider } from '../../structures/rider';

export type RiderRepository = {
  findById(id: string): Promise<Rider | null>;
  update(rider: Rider): Promise<void>;
};
