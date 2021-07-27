import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import rateLimit, { RateLimit }  from "express-rate-limit";

@Middleware({ type: "before" })
export class RateLimitMiddleware implements ExpressMiddlewareInterface {

  private limiter: RateLimit;

  constructor() {
    this.limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_WINDOW) * 1000, // per second
      max: parseInt(process.env.RATE_MAX),
    });
  }

  public use(req: any, res: any, next: (err?: any) => any): any {
    return this.limiter(req, res, next);
  }

}
