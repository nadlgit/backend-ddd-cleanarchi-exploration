import { type DataSourceOptions } from 'typeorm';

export function createTypeOrmPgSqlConfig({
  host,
  port,
  username,
  password,
  database,
  synchronize = false,
}: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize?: boolean;
}): DataSourceOptions {
  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    entities: [`${__dirname}/**/pgsql/entities/*.{ts,js}`],
    synchronize,
    migrations: [],
    migrationsTableName: 'typeorm_migrations',
    migrationsRun: false,
  };
}
