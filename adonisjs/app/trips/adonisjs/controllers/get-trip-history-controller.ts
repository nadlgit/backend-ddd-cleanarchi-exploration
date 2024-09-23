import { inject } from '@adonisjs/core'
import { GetRiderTripHistoryQuery } from '#trips/core/ports/queries/get-rider-trip-history-query'

@inject()
export default class GetTripHistoryController {
  constructor(private readonly getRiderTripHistoryQuery: GetRiderTripHistoryQuery) {}

  async handle() {
    const riderId = '8182202e-1e02-4e6b-b328-b8a93c260d2e'
    return this.getRiderTripHistoryQuery.execute(riderId)
  }
}
