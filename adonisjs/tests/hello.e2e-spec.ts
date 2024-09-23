import { test } from '@japa/runner'

test.group('Hello', () => {
  test('/ (GET)', async ({ client }) => {
    const response = await client.get('/')
    response.assertStatus(200)
    response.assertBody({
      hello: 'world',
    })
  })
})
