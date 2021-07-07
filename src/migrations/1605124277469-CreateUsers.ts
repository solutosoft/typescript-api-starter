import {MigrationInterface, QueryRunner, Table, TableIndex} from "typeorm";
import { User } from "../entities/User";
import { generateHash } from "../global";

export class CreateUsers1605124277469 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "users",
      columns: [
        {
          name: "id",
          type: "varchar(255)",
          isPrimary: true,
        }, {
          name: "name",
          type: "varchar(255)",
        }, {
          name: "username",
          type: "varchar(255)",
        }, {
          name: "password",
          type: "varchar(255)",
          isNullable: true,
        }, {
          name: "rules",
          type: "json",
          isNullable: true,
        }, {
          name: "api_key",
          type: "varchar(255)",
          isNullable: true,
        }, {
          name: "redmine_id",
          type: "bigint",
          unsigned: true,
          isNullable: true,
        }, {
          name: "confirmation_token",
          type: "varchar(255)",
          isNullable: true,
        }, {
          name: "confirmation_sent_at",
          type: "datetime",
          isNullable: true,
        }, {
          name: "reset_token",
          type: "varchar(255)",
          isNullable: true,
        }, {
          name: "reset_sent_at",
          type: "datetime",
          isNullable: true,
        }, {
          name: "created_at",
          type: "datetime",
          default: "CURRENT_TIMESTAMP",
          isNullable: true,
        }, {
          name: "updated_at",
          type: "datetime",
          isNullable: true,
        }, {
          name: "confirmed_at",
          type: "datetime",
          isNullable: true,
        }, {
          name: "last_signin_at",
          type: "datetime",
          isNullable: true,
        },
      ],
    }));

    await queryRunner.createIndex("users", new TableIndex({
      name: "ix_users_username",
      columnNames: ["username"],
    }));

    const admin = await this.createUser({
      name: "Administrator",
      username: "admin",
      password: "admin",
    });

    const api = await this.createUser({
      name: "API",
      username: "api",
      apiKey: process.env.APP_KEY,
    });

    await queryRunner.manager.save(admin);
    await queryRunner.manager.save(api);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }

  private async createUser(user: any): Promise<User> {
    const result  = new User();
    result.name = user.name;
    result.username = user.username;
    result.password = user.password ? await generateHash(user.password) : null;
    result.apiKey = user.apiKey;
    result.createdAt = new Date();
    result.confirmedAt = new Date();
    return result;
  }

}
