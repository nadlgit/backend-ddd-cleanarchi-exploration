import { v4 as uuidv4 } from 'uuid';
import { type IdProvider } from '../../core/ports/providers/id-provider';

export class RandomIdProvider implements IdProvider {
  generate() {
    return uuidv4();
  }
}
