/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

const BookTripController = () => import('#trips/adonisjs/controllers/book-trip-controller')
const GetTripHistoryController = () =>
  import('#trips/adonisjs/controllers/get-trip-history-controller')

router.post('trips', [BookTripController])
router.get('trips/history', [GetTripHistoryController])
