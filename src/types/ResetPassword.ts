import { IsNotEmpty, IsString } from "class-validator";

export class ResetPassword {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
