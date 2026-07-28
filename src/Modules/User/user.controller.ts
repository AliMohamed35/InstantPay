import type { Request, Response } from "express";
import { userService } from "./user.service.ts";
import { ApiResponse } from "../../utilities/apiResponse.ts";

class UserController {
  public async softDeleteUser(req: Request, res: Response) {
    const userId = req.user?.userId;
    await userService.softDeleteUser(userId);
    res.status(200).json({ message: "user soft deleted!", success: true });
  }

  public async changePassword(req: Request, res: Response) {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.userId;
    await userService.changePassword(userId, oldPassword, newPassword);

    return res.status(200).json({
      message: "user password changed successfully",
      success: true,
      data: { success: true },
    });
  }

  public async forgetPassword(req: Request, res: Response) {
    const { email } = req.body;
    await userService.forgetPassword(email);

    return res.status(200).json({
      message: "user password reset successfully",
      success: true,
      data: { success: true },
    });
  }

  public async resetPassword(req: Request, res: Response) {
    const { email, otp, newPassword } = req.body;
    await userService.resetPassword(email, otp, newPassword);

    return res.status(200).json({
      message: "user password reset successfully",
      success: true,
      data: { success: true },
    });
  }

  public async getSpecificUser(req: Request, res: Response) {
    const userId = req.user?.userId;
    const specificUser = await userService.getSpecificUser(userId);
    return res.status(200).json({
      message: "User retrieved successfully",
      success: true,
      data: specificUser,
    });
  }

  public async updateUser(req: Request, res: Response) {
    const userData = req.body;
    const userId = req.user?.userId;
    await userService.fullyUpdateUser(userId, userData);
    return res
      .status(200)
      .json({ message: "user updated successfully", success: true });
  }

  public async partialUpdateUser(req: Request, res: Response) {
    const userField = req.body;
    const userId = req.user?.userId;
    await userService.partialUpdateUser(userId, userField);
    return res
      .status(200)
      .json({ message: "user updated successfully", success: true });
  }

  public async checkBalance(req: Request, res: Response) {
    const requestedUser = req.user?.userId;
    const accountId = req.params.id;
    const { pin } = req.body;
    const balance = await userService.checkBalance(
      requestedUser,
      accountId,
      pin,
    );
    return ApiResponse.sendSuccess(res, balance, "OK", 200);
  }

  public async recharge(req: Request, res: Response) {
    const requestedUser = req.user?.userId;
    const accountId = req.params.id;
    const { amount } = req.body;
    const addedAmount = await userService.recharge(
      requestedUser,
      accountId,
      amount,
    );
    return ApiResponse.sendSuccess(res, addedAmount, "OK", 200);
  }

  public async transferToUser(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { senderAccountId, receiverAccountId, amount, pin } = req.body;

    const result = await userService.transferToUser(
      userId,
      senderAccountId,
      receiverAccountId,
      amount,
      pin,
    );

    return ApiResponse.sendSuccess(res, result, "OK", 200);
  }
}

export const userController = new UserController();
