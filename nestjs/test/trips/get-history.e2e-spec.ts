import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app-module';
import { type TripSnapshot } from '../../src/trips/core/structures/trip';
import { PgSqlTrip } from '../../src/trips/gateways/repositories/pgsql/entities/pgsql-trip';

describe('Feature: Get rider trip history', () => {
  const riderId = '8182202e-1e02-4e6b-b328-b8a93c260d2e';
  const riderTrip1: TripSnapshot = {
    id: 'abcd3eb6-8368-46b0-8111-c85bcc9f2cc9',
    riderId,
    startLocation: '3 place Olympe-de-Gouges, Cergy',
    endLocation: '2 boulevard Malesherbes, Paris',
    bookedOn: new Date('2020-12-01 18:19:47'),
    carCategory: 'NORMAL',
    price: 75,
    driverId: null,
    status: 'CANCELLED',
  };
  const riderTrip2: TripSnapshot = {
    id: '0d60752f-e8e3-480b-9d0c-64624544fee5',
    riderId,
    startLocation: '2 boulevard Malesherbes, Paris',
    endLocation: '40 boulevard Malesherbes, Paris',
    bookedOn: new Date('2020-12-01 22:19:47'),
    carCategory: 'NORMAL',
    price: 30.5,
    driverId: '7471f1c4-bbc8-47d4-a158-a661aca5a247',
    status: 'CONFIRMED',
  };
  const otherTrip: TripSnapshot = {
    id: '11113eb6-8368-46b0-8111-c85bcc9f2cc9',
    riderId: 'f1c47471-bbc8-47d4-a158-a5a247a661ac',
    startLocation: '3 place Olympe-de-Gouges, Cergy',
    endLocation: '13 rue de la Destinée, Cergy',
    bookedOn: new Date('2020-12-01 15:19:47'),
    carCategory: 'NORMAL',
    price: 5,
    driverId: null,
    status: 'BOOKED',
  };

  let app: INestApplication;

  const initDatabase = async () => {
    const dataSource = app.get(DataSource);
    for (const entity of dataSource.entityMetadatas) {
      await dataSource.manager.clear(entity.name);
    }
    const dbTripRepository = dataSource.getRepository(PgSqlTrip);
    await dbTripRepository.save(
      [otherTrip, riderTrip1, riderTrip2].map((trip) =>
        dbTripRepository.create(trip),
      ),
    );
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await initDatabase();
  });

  afterEach(async () => {
    await app.close();
  });

  it('gets rider trip history', async () => {
    const response = await request(app.getHttpServer()).get('/trips/history');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      riderId,
      trips: response.body.trips,
    });
    expect(response.body.trips).toHaveLength(2);
    expect(response.body.trips).toContainEqual({
      tripId: riderTrip1.id,
      startLocation: riderTrip1.startLocation,
      endLocation: riderTrip1.endLocation,
      bookedOn: riderTrip1.bookedOn.toISOString(),
      carCategory: riderTrip1.carCategory,
      price: riderTrip1.price,
      driverId: riderTrip1.driverId,
      status: riderTrip1.status,
    });
    expect(response.body.trips).toContainEqual({
      tripId: riderTrip2.id,
      startLocation: riderTrip2.startLocation,
      endLocation: riderTrip2.endLocation,
      bookedOn: riderTrip2.bookedOn.toISOString(),
      carCategory: riderTrip2.carCategory,
      price: riderTrip2.price,
      driverId: riderTrip2.driverId,
      status: riderTrip2.status,
    });
  });
});
