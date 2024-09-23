import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1726617870571 implements MigrationInterface {
  name = 'CreateTables1726617870571';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "drivers" ("id" uuid NOT NULL, "name" character varying NOT NULL, "car_category" character varying NOT NULL, "is_available" boolean NOT NULL, "location" text, "current_trip_id" uuid, CONSTRAINT "PK_92ab3fb69e566d3eb0cae896047" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "driver_domain_events" ("id" uuid NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "type" character varying NOT NULL, "data" json NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_45702eb5b7fc6b7ed3d7194c362" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "riders" ("id" uuid NOT NULL, "birth_date" date NOT NULL, "plan" character varying NOT NULL, CONSTRAINT "PK_6c17e67f760677500c29d68e689" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "trips" ("id" uuid NOT NULL, "rider_id" uuid NOT NULL, "start_location" character varying NOT NULL, "end_location" character varying NOT NULL, "bookedOn" TIMESTAMP WITH TIME ZONE NOT NULL, "car_category" character varying NOT NULL, "price" numeric(8,2) NOT NULL, "driver_id" uuid, "status" character varying NOT NULL, CONSTRAINT "PK_f71c231dee9c05a9522f9e840f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "trip_domain_events" ("id" uuid NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "type" character varying NOT NULL, "data" json NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_2d7186e326562d17b3d25affd01" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "trip_domain_events"`);
    await queryRunner.query(`DROP TABLE "trips"`);
    await queryRunner.query(`DROP TABLE "riders"`);
    await queryRunner.query(`DROP TABLE "driver_domain_events"`);
    await queryRunner.query(`DROP TABLE "drivers"`);
  }
}
