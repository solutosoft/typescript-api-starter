import { Migration } from "typeorm";
import { createConnection, getConnectionOptions } from "typeorm-seeding";
import { createApp } from "../src/app";
import supertest from "supertest";

export function createSupertest(): supertest.SuperTest<supertest.Test> {
  const app = createApp();
  return supertest(app);
}

export async function setupDatabase(): Promise<Migration[]> {
  const options = await getConnectionOptions();
  const connection = await createConnection(options);

  if (connection && connection.isConnected) {
    await connection.dropDatabase();
    return connection.runMigrations();
  }

  return [];
}
