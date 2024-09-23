import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { type GetRiderTripHistoryQuery } from '../../core/ports/queries/get-rider-trip-history-query';
import { BookTripUseCase } from '../../core/usecases/book-trip';

@Controller('trips')
export class TripController {
  constructor(
    private readonly bookTripUseCase: BookTripUseCase,
    @Inject('GetRiderTripHistoryQuery')
    private readonly getRiderTripHistoryQuery: GetRiderTripHistoryQuery,
  ) {}

  @Post()
  async bookTrip(
    @Body()
    body: {
      id: string;
      startLocation: string;
      endLocation: string;
    },
  ) {
    return this.bookTripUseCase.execute({
      ...body,
      riderId: '8182202e-1e02-4e6b-b328-b8a93c260d2e',
    });
  }

  @Get('/history')
  async getHistory() {
    const riderId = '8182202e-1e02-4e6b-b328-b8a93c260d2e';
    return this.getRiderTripHistoryQuery.execute(riderId);
  }
}
