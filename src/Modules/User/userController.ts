import type { NextFunction, Request, Response } from "express";
import logger from "../../utilities/logger/winston.ts";
import { userService } from "./UserService.ts";

class UserController {
  public async softDeleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      await userService.softDeleteUser(userId);

      res.status(200).json({ message: "user soft deleted!", success: true });
    } catch (error: any) {
      const statusCode = error.statusCode ?? 500;
      logger.error("this is an UserController error: " + `${error}`);
      res.status(statusCode).json({
        message: "internal server error",
        success: false,
        error: error.message,
      });
    }
  }

  public async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await userService.deleteUser(userId);
      res.clearCookie("accessToken").clearCookie("refreshToken");

      return res
        .status(201)
        .json({ message: "user deleted! successfully", success: true });
    } catch (error: any) {
      const statusCode = error.statusCode ?? 500;
      logger.error("this is an delete UserController error: " + `${error}`);
      res.status(statusCode).json({
        message: "internal server error",
        success: false,
        error: error.message,
      });
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user?.userId;
      await userService.changePassword(userId, oldPassword, newPassword);

      return res.status(200).json({
        message: "user password changed successfully",
        success: true,
        data: { success: true },
      });
    } catch (error: any) {
      const statusCode = error.statusCode ?? 500;
      logger.error(
        `this is a controller change password error: ${error.stack ?? error.message ?? error}`,
      );
      res.status(statusCode).json({
        message: "internal server error",
        success: false,
        error: error.message,
      });
    }
  }
}

export const userController = new UserController();
