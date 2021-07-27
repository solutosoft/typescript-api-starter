import compression from "compression";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";

@Middleware({ type: "before" })
export class CompressionMiddleware implements ExpressMiddlewareInterface {

  public use(req: any, res: any, next: (err?: any) => any): any {
    return compression()(req, res, next);
  }

}
