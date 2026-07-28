import type { Request, Response } from "express";
import { transactionService } from "./transactions.service.ts";
import { ApiResponse } from "../../utilities/apiResponse.ts";
import { BadRequestException } from "../../Exceptions/CustomExceptions/Exceptions.ts";

class TransactionController {
  public async getAccountHistory(req: Request, res: Response) {
    const userId = req.user!.userId;
    const accountId = req.params.id;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    if (typeof accountId !== "string") {
      throw new BadRequestException("Invalid account id");
    }
    const result = await transactionService.getAccountHistory(
      userId,
      accountId,
      page,
      limit,
    );

    return ApiResponse.sendSuccess(res, result, "OK", 200);
  }
}

export const transactionController = new TransactionController();
