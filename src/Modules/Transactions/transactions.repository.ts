import { Transaction } from "../../DB/Models/index.ts";
import AbstractRepository from "../../DB/Repository/AbstractRepository.ts";

export class TransactionRepository extends AbstractRepository<Transaction> {
  constructor() {
    super(Transaction);
  }
}

export const transactionRepository = new TransactionRepository();
