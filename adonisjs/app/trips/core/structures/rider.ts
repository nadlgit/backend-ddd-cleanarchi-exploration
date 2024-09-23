import { DateOnly } from '#shared/core/structures/date-only'
import { type RiderPlan } from '#trips/core/structures/rider-plan'

export class Rider {
  constructor(
    private readonly id: string,
    private readonly birthDate: DateOnly,
    private plan: RiderPlan = 'BASIC'
  ) {}

  isTripCountLessThanDailyLimit(count: number): boolean {
    const dailyLimits = {
      BASIC: 2,
      PREMIUM: 4,
    } as const
    return count < dailyLimits[this.plan]
  }

  isBirthday(date: Date): boolean {
    return this.birthDate.isAnniversary(date)
  }

  toSnapshot(): RiderSnapshot {
    return {
      id: this.id,
      birthDate: this.birthDate.value,
      plan: this.plan,
    }
  }

  static fromSnapshot(snapshot: RiderSnapshot): Rider {
    return new Rider(snapshot.id, DateOnly.fromString(snapshot.birthDate), snapshot.plan)
  }
}

export type RiderSnapshot = {
  id: string
  birthDate: string
  plan: RiderPlan
}
