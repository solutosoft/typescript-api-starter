import { IsNotEmpty, IsString } from "class-validator";

export class Credentials {
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsString()
  @IsNotEmpty()
  password?: string;
}
