import type { Account } from "../../DB/Models/index.ts";
import {
  AccountAlreadyExist,
  NotFoundException,
  UnauthorizedException,
  UserAlreadyExistException,
} from "../../Exceptions/CustomExceptions/Exceptions.ts";
import { userRepository } from "../User/user.repository.ts";
import { accountRepository } from "./account.repository.ts";
import type { accountCreatedDTO, addAccountDTO } from "./dto/addAccountDTO.ts";
import { checkAccountExistence } from "./providers/checkAccountExistence.ts";

const userExistence = () => {
  throw new UserAlreadyExistException("User doesn't exist!");
};

const accountExistence = () => {
  throw new AccountAlreadyExist("Account already exist!");
};

class AccountService {
  public async addAccount(
    userId: any,
    accountData: addAccountDTO,
  ): Promise<accountCreatedDTO> {
    // check user existence
    const userExist = await userRepository.findById(userId);
    if (!userExist) throw userExistence();

    // check account existence
    const accountExist = await accountRepository.findOne({
      where: { accountNumber: accountData.accountNumber },
    });
    if (accountExist) throw accountExistence();

    await accountRepository.create({
      userId,
      accountNumber: accountData.accountNumber,
      type: accountData.type,
      currency: accountData.currency,
    });

    return {
      accountNumber: accountData.accountNumber,
      type: accountData.type,
      currency: accountData.currency,
    };
  }

  public async getAccount(accountId: string) {
    const accountExist = await checkAccountExistence(accountId);
    if (!accountExist) throw new NotFoundException("Account not found!");
    return accountExist;
  }

  public async removeAccount(accountId: string, RequesterId: any) {
    const accountExist = await checkAccountExistence(accountId);

    if (!accountExist) throw new NotFoundException("Account doesn't exist!");
    if (accountExist.userId !== RequesterId)
      throw new UnauthorizedException("Not your account!");

    await accountRepository.delete({ where: { accountId } });
  }

  public async getAccountByNumber(accountNumber: string) {
    const accountExistence = await accountRepository.findOne({
      where: { accountNumber },
    });
    if (!accountExistence) throw new NotFoundException("Account not found!");

    return accountExistence;
  }

  public async listAccounts(userId: any) {
    const userExist = await userRepository.findById(userId);
    if (!userExist) throw userExistence();

    const accounts: Account[] = await accountRepository.findAll({
      where: { userId },
    });
    return accounts;
  }
}

export const accountService = new AccountService();
