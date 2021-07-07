import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Exclude } from "class-transformer";

@Entity("users")
export class User {

  @PrimaryGeneratedColumn("uuid")
  @Exclude()
  id: string;

  @Column()
  name: string;

  @Column()
  @Exclude()
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  apiKey: string;

  @Column()
  @Exclude()
  confirmedAt?: Date;

  @Column()
  @Exclude()
  confirmationSentAt?: Date;

  @Column()
  @Exclude()
  confirmationToken?: string;

  @Column()
  @Exclude()
  resetSentAt?: Date;

  @Column()
  @Exclude()
  resetToken?: string;

  @Column()
  @Exclude()
  lastSigninAt?: Date;

  @Exclude()
  @CreateDateColumn()
  createdAt?: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt?: Date;
}
