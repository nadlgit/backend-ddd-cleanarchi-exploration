import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';

export class PgSqlTestDatabase {
  private constructor(
    private readonly container: StartedPostgreSqlContainer,
    private readonly dataSource: DataSource,
  ) {}

  static async setup() {
    const { createTypeOrmPgSqlConfig } = await import(
      '../../../typeorm-config'
    );
    const container = await new PostgreSqlContainer().start();
    const dataSource = new DataSource(
      createTypeOrmPgSqlConfig({
        host: container.getHost(),
        port: container.getPort(),
        username: container.getUsername(),
        password: container.getPassword(),
        database: container.getDatabase(),
        synchronize: true,
      }),
    );
    await dataSource.initialize();
    return new PgSqlTestDatabase(container, dataSource);
  }

  async teardown() {
    await this.dataSource.destroy();
    await this.container.stop();
  }

  async clear() {
    for (const entity of this.dataSource.entityMetadatas) {
      await this.dataSource.manager.clear(entity.name);
    }
  }

  get entityManager() {
    return this.dataSource.manager;
  }
}
