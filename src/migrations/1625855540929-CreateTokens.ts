import {MigrationInterface, QueryRunner, Table, TableIndex} from "typeorm";

export class CreateTokens1625855540929 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: "tokens",
        columns: [
          {
            name: "user_id",
            type: "varchar(255)",
          }, {
            name: "token",
            type: "varchar(255)",
            isPrimary: true,
          }, {
            name: "created_at",
            type: "datetime",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }));

      await queryRunner.createIndex("tokens", new TableIndex({
        name: "ix_tokens_user",
        columnNames: ["user_id"],
      }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable("tokens");
    }

}
