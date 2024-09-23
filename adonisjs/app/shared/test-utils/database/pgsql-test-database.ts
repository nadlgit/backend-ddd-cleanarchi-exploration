import app from '@adonisjs/core/services/app'
import config from '@adonisjs/core/services/config'
import { MigrationRunner } from '@adonisjs/lucid/migration'
import db from '@adonisjs/lucid/services/db'
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'

const CONNECTION_NAME = 'tcpostgres'

export class PgSqlTestDatabase {
  readonly queryClient = db.connection(CONNECTION_NAME)

  private constructor(private readonly container: StartedPostgreSqlContainer) {}

  static async setup() {
    const { port, user, password, database } = config.get<{
      host: string
      port: number
      user: string
      password: string
      database: string
    }>(`database.connections.${CONNECTION_NAME}.connection`)
    const container = await new PostgreSqlContainer()
      .withExposedPorts({
        container: 5432,
        host: port,
      })
      .withUsername(user)
      .withPassword(password)
      .withDatabase(database)
      .start()
    await new MigrationRunner(db, app, {
      direction: 'up',
      connectionName: CONNECTION_NAME,
    }).run()
    return new PgSqlTestDatabase(container)
  }

  async teardown() {
    await this.container.stop()
  }

  async clear() {
    for (const tableName of await this.queryClient.getAllTables(['public'])) {
      if (!tableName.includes('adonis')) {
        await this.queryClient.truncate(tableName)
      }
    }
  }
}
