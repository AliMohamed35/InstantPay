import { LedgerEntry, Transaction } from "../../DB/Models/index.ts";
import AbstractRepository from "../../DB/Repository/AbstractRepository.ts";

export class TransactionRepository extends AbstractRepository<Transaction> {
  constructor() {
    super(Transaction);
  }

  public getHistoryByAccount(accountId: string, limit: number, offset: number) {
    return LedgerEntry.findAndCountAll({
      where: { accountId },
      include: [
        {
          model: Transaction,
          as: "transaction",
          attributes: ["referenceNumber", "type", "status", "createdAt"],
        },
      ],
      order: [
        ["createdAt", "DESC"],
        ["entryId", "DESC"],
      ],
      limit,
      offset,
    });
  }
}

export const transactionRepository = new TransactionRepository();
