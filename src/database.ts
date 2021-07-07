import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { User } from "./entities/User";
import { CreateUsers1605124277469 } from "./migrations/1605124277469-CreateUsers";

export function getDatabaseOptions() : any {
  return {
    name: "default",
    type: "mysql",
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: process.env.DB_LOGGING == "on",
    namingStrategy: new SnakeNamingStrategy(),
    entities: [
      User,
    ],
    migrations: [
      CreateUsers1605124277469,
    ],
    factories: [
      "tests/factories/**/*{.ts,.js}",
    ],
  };
}
