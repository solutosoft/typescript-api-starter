import { ActionParameters } from "@caporal/core";
import { getConnectionManager } from "typeorm";
import { getDatabaseOptions } from "../database";

export async function migrate(params: ActionParameters): Promise<void> {
  const { logger } = params;
  const options = getDatabaseOptions();

  logger.info("Starting database migration");
  try {
    const connection = getConnectionManager().create(options);
    await connection.connect();
    await connection.runMigrations();
    await connection.close();
  } catch (err) {
    logger.info(JSON.stringify(err));
  }
  logger.info("Finished database migration");
};
