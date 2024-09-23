export const CAR_CATEGORIES = ['NORMAL', 'UBERX'] as const

export type CarCategory = (typeof CAR_CATEGORIES)[number]
