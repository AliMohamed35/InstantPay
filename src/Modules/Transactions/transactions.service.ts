import {
  NotFoundException,
  UnauthorizedException,
} from "../../Exceptions/CustomExceptions/Exceptions.ts";
import { accountRepository } from "../Accounts/accountRepository.ts";
import { transactionRepository } from "./transactions.repository.ts";

class TransactionService {
  public async getAccountHistory(
    userId: string,
    accountId: string,
    page: number,
    limit: number,
  ) {
    const account = await accountRepository.findById(accountId);
    if (!account) throw new NotFoundException("Account doesn't exist");
    if (account.userId !== userId)
      throw new UnauthorizedException("Not your account!");

    const offset = (page - 1) * limit;

    const { rows, count } = await transactionRepository.getHistoryByAccount(
      accountId,
      limit,
      offset,
    );

    const history = rows.map((entry) => ({
      entryId: entry.entryId,
      amount: entry.amount,
      direction: entry.amount < 0 ? "DEBIT" : "CREDIT", // money out vs in
      createdAt: entry.createdAt,
      transaction: entry.get("transaction"),
    }));

    return {
      history,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

export const transactionService = new TransactionService();
