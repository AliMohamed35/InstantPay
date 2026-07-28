import logger from "../../../utilities/logger/winston.ts";
import { accountRepository } from "../account.repository.ts";

export const checkAccountExistence = async (accountId: any) => {
  try {
    const accountExist = await accountRepository.findById(accountId);

    return accountExist;
  } catch (error: any) {
    logger.error(`this is a check account existence error: ${error.message}`);
  }
};
