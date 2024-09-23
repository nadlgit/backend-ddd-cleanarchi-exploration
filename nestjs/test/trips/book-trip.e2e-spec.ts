import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { setTimeout } from 'node:timers/promises';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app-module';
import { PgSqlDriver } from '../../src/drivers/gateways/repositories/pgsql/entities/pgsql-driver';
import { StubDateProvider } from '../../src/shared/test-utils/providers/stub-date-provider';
import { PgSqlRider } from '../../src/trips/gateways/repositories/pgsql/entities/pgsql-rider';
import { PgSqlTrip } from '../../src/trips/gateways/repositories/pgsql/entities/pgsql-trip';

describe('Feature: Book a trip', () => {
  const tripId = '0d60752f-e8e3-480b-9d0c-64624544fee5';
  const rider = {
    id: '8182202e-1e02-4e6b-b328-b8a93c260d2e',
    birthDate: '2000-01-01',
    plan: 'BASIC',
  } as const;
  const driver = {
    id: '7471f1c4-bbc8-47d4-a158-a661aca5a247',
    name: 'John Doe',
    carCategory: 'NORMAL',
    isAvailable: true,
    location: '43 boulevard Malesherbes, Paris',
    currentTripId: null,
  } as const;
  const startLocation = '2 boulevard Malesherbes, Paris';
  const endLocation = '40 boulevard Malesherbes, Paris';
  const currentDateTime = new Date('2020-12-01 22:19:47');

  let app: INestApplication;

  const initDatabase = async () => {
    const dataSource = app.get(DataSource);
    for (const entity of dataSource.entityMetadatas) {
      await dataSource.manager.clear(entity.name);
    }
    const dbRiderRepository = dataSource.getRepository(PgSqlRider);
    await dbRiderRepository.save(dbRiderRepository.create(rider));
    const dbDriverRepository = dataSource.getRepository(PgSqlDriver);
    await dbDriverRepository.save(dbDriverRepository.create(driver));
  };

  const getTripSnapshots = async () => {
    const dbRepository = app.get(DataSource).getRepository(PgSqlTrip);
    const trips = await dbRepository.find();
    return trips.map(
      ({
        id,
        riderId,
        startLocation,
        endLocation,
        bookedOn,
        carCategory,
        price,
        driverId,
        status,
      }) => ({
        id,
        riderId,
        startLocation,
        endLocation,
        bookedOn,
        carCategory,
        price,
        driverId,
        status,
      }),
    );
  };

  const getDriverSnapshots = async () => {
    const dbRepository = app.get(DataSource).getRepository(PgSqlDriver);
    const trips = await dbRepository.find();
    return trips.map(
      ({ id, name, carCategory, isAvailable, location, currentTripId }) => ({
        id,
        name,
        carCategory,
        isAvailable,
        location,
        currentTripId,
      }),
    );
  };

  const waitForConfirmation = async () => setTimeout(2000);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('DateProvider')
      .useValue(new StubDateProvider())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await initDatabase();
  });

  afterEach(async () => {
    await app.close();
  });

  it('books a trip (happy path)', async () => {
    const dateProvider = app.get<StubDateProvider>('DateProvider');
    dateProvider.setCurrentDateTime(currentDateTime);

    const response = await request(app.getHttpServer()).post('/trips').send({
      id: tripId,
      startLocation,
      endLocation,
    });

    expect(response.status).toBe(201);

    await waitForConfirmation();

    const tripSnapshots = await getTripSnapshots();
    expect(tripSnapshots).toEqual([
      {
        id: tripId,
        riderId: rider.id,
        startLocation,
        endLocation,
        carCategory: 'NORMAL',
        bookedOn: currentDateTime,
        price: 30.5,
        driverId: driver.id,
        status: 'CONFIRMED',
      },
    ]);
    const driverSnapshots = await getDriverSnapshots();
    expect(driverSnapshots).toEqual([
      {
        ...driver,
        isAvailable: false,
        currentTripId: tripId,
      },
    ]);
  });
});
