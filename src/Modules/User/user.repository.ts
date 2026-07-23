import User from "../../DB/Models/User/User.ts";
import AbstractRepository from "../../DB/Repository/AbstractRepository.ts";

export class UserRepository extends AbstractRepository<User> {
  constructor() {
    super(User);
  }
}

export const userRepository = new UserRepository();
