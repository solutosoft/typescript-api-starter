import jwt from "jsonwebtoken";

export function createJwt(payload: object): string {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: `${process.env.JWT_EXPIRATION}m`,
  });
}

export function checkJwt(authorization: string): any {
  const [,token] = authorization.split(" ");
  return jwt.verify(token, process.env.JWT_SECRET);
}
