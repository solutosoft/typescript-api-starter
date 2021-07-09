import { IsNotEmpty, IsString } from "class-validator";

export class RefreshToken {
  @IsString()
  @IsNotEmpty()
  token: string;
}
