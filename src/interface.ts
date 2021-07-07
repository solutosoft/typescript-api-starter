import { IsNotEmpty, IsString } from "class-validator";

export enum RequestOrigin {
  MOBILE = "mobile",
  WEB = "web",
  PWA = "pwa"
};

export interface FindResult {
  results: any[];
};

export interface RequestLogInfo {
  content: any;
  path: string;
  user: {id: string};
  parent?: {id: number};
}

export class Credentials {
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsString()
  @IsNotEmpty()
  password?: string;
}

export class SignUp extends Credentials {
  @IsString()
  @IsNotEmpty()
  name?: string;
}

export class ResetPassword {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
