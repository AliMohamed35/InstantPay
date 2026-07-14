import type { NextFunction, Request, Response } from "express";
import logger from "../../utilities/logger/winston.ts";
import { userService } from "./userService.ts";

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
}

export const userController = new UserController();
