import User from "../../DB/Models/User/User.ts";
import AbstractRepository from "../../DB/Repository/AbstractRepository.ts";

class AuthRepository extends AbstractRepository<User> {
  constructor() {
    super(User);
  }
}

export const authRepository = new AuthRepository();
