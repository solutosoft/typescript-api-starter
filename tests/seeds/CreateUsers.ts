import { Connection } from "typeorm";
import { Factory, Seeder } from "typeorm-seeding";
import data from "../data/users";

export default class CreateUsers implements Seeder {

  async run(factory: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into("users")
      .values(data)
      .execute();
  }

}
