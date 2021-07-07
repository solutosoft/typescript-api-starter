import nocache from "nocache";
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

@Middleware({ type: "before" })
export class SecurityNoCacheMiddleware implements ExpressMiddlewareInterface {

  public use(request: any, response: any, next: (err?: any) => any): any {
    return nocache()(request, response, next);
  }

}
