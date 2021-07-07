import { IsNotEmpty, IsString } from "class-validator";

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
