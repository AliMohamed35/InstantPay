import type { NextFunction, Request, Response } from "express";
import type { addAccountDTO } from "./dto/addAccountDTO.ts";
import { accountService } from "./account.service.ts";
import { ApiResponse } from "../../utilities/apiResponse.ts";
import { BadRequestException } from "../../Exceptions/CustomExceptions/Exceptions.ts";

class AccountController {
  public async addAccount(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.userId;
    const accountData: addAccountDTO = req.body;
    const createdAccount = await accountService.addAccount(userId, accountData);

    return ApiResponse.sendSuccess(
      res,
      createdAccount,
      "Account created successfully",
      201,
    );
  }

  public async getAccount(req: Request, res: Response, next: NextFunction) {
    const accountId = req.params.id as unknown as string;
    const account = await accountService.getAccount(accountId);

    return ApiResponse.sendSuccess(
      res,
      account,
      "Account retrieved successfully",
      200,
    );
  }

  public async removeAccount(req: Request, res: Response, next: NextFunction) {
    const RequesterId = req.user?.userId;
    const accountId = req.params.id as unknown as string;
    await accountService.removeAccount(accountId, RequesterId);

    return ApiResponse.sendSuccess(
      res,
      "ok",
      "Account removed successfully",
      200,
    );
  }

  public async getAccountByNumber(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const accountNumber = req.query.accountNumber as string;
    if (!accountNumber)
      throw new BadRequestException("account number is required!");
    const account = await accountService.getAccountByNumber(accountNumber);

    return ApiResponse.sendSuccess(
      res,
      account,
      "Account retrieved successfully",
      200,
    );
  }

  public async listAccounts(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.userId;
    const accounts = await accountService.listAccounts(userId);

    return ApiResponse.sendSuccess(
      res,
      accounts,
      "Account retrieved successfully",
      200,
    );
  }
}

export const accountController = new AccountController();
