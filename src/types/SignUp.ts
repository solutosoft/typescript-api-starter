import { IsNotEmpty, IsString } from "class-validator";
import { Credentials } from "../interface";

export class SignUp extends Credentials {
  @IsString()
  @IsNotEmpty()
  name?: string;
}
