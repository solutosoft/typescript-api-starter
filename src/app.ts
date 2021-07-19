// eslint-disable-next-line import/no-unassigned-import
import "reflect-metadata";
import { Action, createExpressServer } from "routing-controllers";
import { getCustomRepository } from "typeorm";
import { AuthController } from "./controllers/AuthController";
import { isProduction, loadEnv } from "./utils/global";
import { CompressionMiddleware } from "./middlewares/CompressionMiddleware";
import { DatabaseMiddleware } from "./middlewares/DatabaseMiddleware";
import { SecurityHstsMiddleware } from "./middlewares/SecurityHstsMiddleware";
import { SecurityMiddleware } from "./middlewares/SecurityMiddleware";
import { SecurityNoCacheMiddleware } from "./middlewares/SecurityNoCacheMiddleware";
import { UserRepository } from "./repositories/UserRepository";
import { checkJwt, createJwt } from "./utils/jwt";
import { User } from "./entities/User";
import omit from "lodash.omit";

async function findUser(action: Action): Promise<User | false> {
  const request = action.request;
  const response = action.response;

  const authorization = request.headers["authorization"];
  const apiKey = request.query.key || request.headers["x-api-key"];
  const repository = getCustomRepository(UserRepository);

  if (authorization) {
    try {
      const payload = checkJwt(authorization);
      const user = await repository.findOne({ username: payload.username });

      if (user) {
        const token = createJwt(omit(payload, ["exp", "iat"]));
        response.setHeader("token", `Bearer ${token}`);
      }

      return user;
    } catch {
      return false;
    }
  }

  if (apiKey) {
    return await repository.findOneByApiKey(apiKey);
  }

  return false;
}

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
      return await findUser(action);
    },
    authorizationChecker: async (action: Action, roles: string[]) => {
      const user = await findUser(action);
      return user && !roles.length;
    },
  });
}
