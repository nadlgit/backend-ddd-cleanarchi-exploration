import { format, isValid, parse, startOfDay } from 'date-fns'

export class DateOnly {
  private static readonly STRING_FORMAT = 'yyyy-MM-dd'
  private readonly internalDate: Date

  private constructor(date: Date) {
    if (!isValid(date)) {
      throw new Error('Invalid date')
    }
    this.internalDate = startOfDay(date)
  }

  static fromDate(date: Date): DateOnly {
    return new DateOnly(date)
  }

  static fromYearMonthDay(year: number, month: number, day: number): DateOnly {
    return new DateOnly(new Date(year, month - 1, day))
  }

  static fromString(str: string): DateOnly {
    return new DateOnly(parse(str, DateOnly.STRING_FORMAT, new Date()))
  }

  get value(): string {
    return format(this.internalDate, DateOnly.STRING_FORMAT)
  }

  isAnniversary(date: Date): boolean {
    return (
      date.getMonth() === this.internalDate.getMonth() &&
      date.getDate() === this.internalDate.getDate()
    )
  }
}
