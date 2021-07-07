import helmet from "helmet";
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

@Middleware({ type: 'before' })
export class SecurityHstsMiddleware implements ExpressMiddlewareInterface {

  public use(req: any, res: any, next: (err?: any) => any): any {
    return helmet.hsts({
      maxAge: 31536000,
      includeSubDomains: true,
    })(req, res, next);
  }

}
