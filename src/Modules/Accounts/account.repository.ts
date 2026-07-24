import type { Attributes, FindOptions } from "sequelize";
import { Account } from "../../DB/Models/index.ts";
import AbstractRepository from "../../DB/Repository/AbstractRepository.ts";

export class AccountRepository extends AbstractRepository<Account> {
  constructor() {
    super(Account);
  }

  public findByAccountNumber(
    accountNumber: string,
    options?: FindOptions<Attributes<Account>>,
  ) {
    return this.findOne({ ...options, where: { accountNumber } });
  }
}

export const accountRepository = new AccountRepository();
