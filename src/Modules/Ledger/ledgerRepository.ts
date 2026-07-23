import { LedgerEntry } from "../../DB/Models/index.ts";
import AbstractRepository from "../../DB/Repository/AbstractRepository.ts";

export class LedgerRepository extends AbstractRepository<LedgerEntry> {
  constructor() {
    super(LedgerEntry);
  }
}

export const ledgerRepository = new LedgerRepository();
