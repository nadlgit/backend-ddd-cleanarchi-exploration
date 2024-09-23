import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DriverModule } from './drivers/nestjs/driver-module';
import { HelloController } from './hello/hello-controller';
import { TripModule } from './trips/nestjs/trip-module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test.local' : '.env',
    }),
    EventEmitterModule.forRoot(),
    TripModule,
    DriverModule,
  ],
  controllers: [HelloController],
  providers: [],
})
export class AppModule {}
