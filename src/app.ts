// eslint-disable-next-line import/no-unassigned-import
import "reflect-metadata";
import { Action, createExpressServer, useContainer } from "routing-controllers";
import { getCustomRepository } from "typeorm";
import { AuthController } from "./controllers/AuthController";
import { isProduction, loadEnv } from "./global";
import { CompressionMiddleware } from "./middlewares/CompressionMiddleware";
import { DatabaseMiddleware } from "./middlewares/DatabaseMiddleware";
import { SecurityHstsMiddleware } from "./middlewares/SecurityHstsMiddleware";
import { SecurityMiddleware } from "./middlewares/SecurityMiddleware";
import { SecurityNoCacheMiddleware } from "./middlewares/SecurityNoCacheMiddleware";
import { UserRepository } from "./repositories/UserRepository";

export function createApp() {
  loadEnv();

  return createExpressServer({
    development: !isProduction(),
    validation: false,
    cors: {
      origin: true,
      allowedHeaders: [
        "accept",
        "content-type",
        "x-requested-with",
        "x-api-key",
      ],
    },
    controllers: [
      AuthController,
    ],
    middlewares: [
      CompressionMiddleware,
      DatabaseMiddleware,
      SecurityHstsMiddleware,
      SecurityMiddleware,
      SecurityNoCacheMiddleware,
    ],
    currentUserChecker: async (action: Action) => {
      const request = action.request;
      const repository = getCustomRepository(UserRepository);
      const apiKey = request.query.key || request.headers["x-api-key"];

      if (apiKey) {
        return await repository.findOneByApiKey(apiKey);
      }

      return false;
    },
    authorizationChecker: async (action: Action, roles: string[]) => {
      const request = action.request;
      const apiKey = request.query.key || request.headers["x-api-key"];
      const repository = getCustomRepository(UserRepository);

      if (apiKey) {
        const user = await repository.findOneByApiKey(apiKey);
        return user && !roles.length;
      }

      return false;
    },
  });
}
