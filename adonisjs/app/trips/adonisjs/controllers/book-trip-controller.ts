import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { BookTripUseCase } from '#trips/core/usecases/book-trip'

@inject()
export default class BookTripController {
  constructor(private readonly bookTripUseCase: BookTripUseCase) {}

  async handle({ request, response }: HttpContext) {
    const body = request.body()
    const { id, startLocation, endLocation } = await validator.validate(body)
    await this.bookTripUseCase.execute({
      id,
      startLocation,
      endLocation,
      riderId: '8182202e-1e02-4e6b-b328-b8a93c260d2e',
    })
    response.status(201).send('')
  }
}

const validator = vine.compile(
  vine.object({
    id: vine.string().trim().uuid(),
    startLocation: vine.string().trim(),
    endLocation: vine.string().trim(),
  })
)
