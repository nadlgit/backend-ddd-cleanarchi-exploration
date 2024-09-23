import { type DateProvider } from '#shared/core/ports/providers/date-provider'

export class SystemDateProvider implements DateProvider {
  currentDateTime() {
    return new Date()
  }
}
