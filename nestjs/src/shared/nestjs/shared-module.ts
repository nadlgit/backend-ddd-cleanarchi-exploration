import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { createTypeOrmPgSqlConfig } from '../../typeorm-config';
import { NestJsEventPublisher } from '../gateways/providers/nestjs-event-publisher';
import { NestJsEventSubscriptionManager } from '../gateways/providers/nestjs-event-subscription-manager';
import { RandomIdProvider } from '../gateways/providers/random-id-provider';
import { SystemDateProvider } from '../gateways/providers/system-date-provider';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    {
      provide: 'IdProvider',
      useClass: RandomIdProvider,
    },
    {
      provide: 'DateProvider',
      useClass: SystemDateProvider,
    },
    {
      provide: 'EventPublisher',
      inject: [EventEmitter2],
      useFactory: (eventEmitter) => new NestJsEventPublisher(eventEmitter),
    },
    {
      provide: 'EventSubscriptionManager',
      inject: [EventEmitter2],
      useFactory: (eventEmitter) =>
        new NestJsEventSubscriptionManager(eventEmitter),
    },
    {
      provide: DataSource,
      useFactory: async () => {
        await ConfigModule.envVariablesLoaded;
        const dataSource = new DataSource(
          createTypeOrmPgSqlConfig({
            host: process.env.PGSQL_HOST ?? '',
            port: Number.parseInt(process.env.PGSQL_PORT ?? ''),
            username: process.env.PGSQL_USERNAME ?? '',
            password: process.env.PGSQL_PASSWORD ?? '',
            database: process.env.PGSQL_DATABASE ?? '',
          }),
        );
        return dataSource;
      },
    },
  ],
  exports: [
    'IdProvider',
    'DateProvider',
    'EventPublisher',
    'EventSubscriptionManager',
    DataSource,
  ],
})
export class SharedModule {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.dataSource.initialize();
  }

  async onApplicationShutdown() {
    await this.dataSource.destroy();
  }
}
