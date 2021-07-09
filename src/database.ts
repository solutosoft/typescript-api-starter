import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Token } from "./entities/Token";
import { User } from "./entities/User";
import { CreateUsers1605124277469 } from "./migrations/1605124277469-CreateUsers";
import { CreateTokens1625855540929 } from "./migrations/1625855540929-CreateTokens";

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
      Token,
    ],
    migrations: [
      CreateUsers1605124277469,
      CreateTokens1625855540929,
    ],
    factories: [
      "tests/factories/**/*{.ts,.js}",
    ],
  };
}
