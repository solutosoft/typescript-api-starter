import { getConnectionManager } from "typeorm";
import { loadEnv } from "../../src/global";
import { DatabaseMiddleware } from "../../src/middlewares/DatabaseMiddleware";

describe("Connection Middleware", () => {
  let middleware: DatabaseMiddleware;

  beforeEach(() => {
    loadEnv();
    middleware = new DatabaseMiddleware();
  });


  test("Should create database connection", () => {
    const request = {
      path: "/auth",
    };

    middleware.use(request, null, (error) => {
      const exists = getConnectionManager().has("default");
      expect(exists).toBe(true);
    });
  });
});
