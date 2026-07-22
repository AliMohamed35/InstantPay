import { Account } from "../../DB/Models/index.ts";
import AbstractRepository from "../../DB/Repository/AbstractRepository.ts";

export class AccountRepository extends AbstractRepository<Account> {
  constructor() {
    super(Account);
  }
}

export const accountRepository = new AccountRepository();
