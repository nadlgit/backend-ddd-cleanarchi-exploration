import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
    },
    tcpostgres: {
      client: 'pg',
      connection: {
        host: 'localhost',
        port: 32888,
        user: 'test',
        password: 'test',
        database: 'testcontainers',
      },
    },
  },
})

export default dbConfig
