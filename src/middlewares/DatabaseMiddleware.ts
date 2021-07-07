import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { getConnectionManager } from "typeorm";
import { getDatabaseOptions } from "../database";

@Middleware({ type: "before" })
export class DatabaseMiddleware implements ExpressMiddlewareInterface {

  use(request: any, response: any, next: (err?: any) => any): void {
    if (getConnectionManager().has("default")) {
      next();
    } else {
      getConnectionManager()
        .create(getDatabaseOptions())
        .connect()
        .then(connection => connection.runMigrations())
        .then(() => next())
        .catch(e => next(e));
    }
  }
}
