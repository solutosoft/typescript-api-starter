import { Entity, Column, CreateDateColumn, PrimaryColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity("tokens")
export class Token {

  @PrimaryColumn()
  token: string;

  @CreateDateColumn()
  createdAt?: Date;

  @ManyToOne(() => User, user => user.tokens)
  user: User;

}
