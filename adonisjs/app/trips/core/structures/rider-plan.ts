export const RIDER_PLANS = ['BASIC', 'PREMIUM'] as const

export type RiderPlan = (typeof RIDER_PLANS)[number]
