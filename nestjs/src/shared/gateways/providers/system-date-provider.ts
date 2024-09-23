import { type DateProvider } from '../../core/ports/providers/date-provider';

export class SystemDateProvider implements DateProvider {
  currentDateTime() {
    return new Date();
  }
}
