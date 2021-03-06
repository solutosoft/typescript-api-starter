import { EntityRepository, Repository } from "typeorm";
import { User } from "../entities/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {

  findOneByApiKey(apiKey: string): Promise<User> {
    return this.findOne({ apiKey: apiKey });
  }

  findOneByUsername(username: string): Promise<User> {
    return this.findOne({ username: username });
  }

}
