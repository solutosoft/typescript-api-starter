import { IsNotEmpty, IsString } from "class-validator";
import { Credentials } from "./Credentials";

export class SignUp extends Credentials {
  @IsString()
  @IsNotEmpty()
  name?: string;
}
