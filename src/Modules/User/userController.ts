import type { NextFunction, Request, Response } from "express";
import logger from "../../utilities/logger/winston.ts";
import { userService } from "./userService.ts";

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

  public async getSpecificUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      const specificUser = await userService.getSpecificUser(userId);
      return res.status(200).json({
        message: "User retrieved successfully",
        success: true,
        data: specificUser,
      });
    } catch (error: any) {
      const statusCode = error.statusCode ?? 500;
      logger.error("this is a userController error ", error.name);
      res.status(statusCode).json({
        message: "internal server error",
        success: false,
        error: error.message,
      });
    }
  }

  public async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = req.body;
      const userId = req.user?.userId;
      await userService.fullyUpdateUser(userId, userData);
      return res
        .status(201)
        .json({ message: "user updated successfully", success: true });
    } catch (error: any) {
      const statusCode = error.statusCode ?? 500;
      logger.error("this is an updateUser error ", error.message, error.stack);
      res
        .status(statusCode)
        .json({ message: "internal server error", success: false });
    }
  }

  public async partialUpdateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userField = req.body;
      const userId = req.user?.userId;
      await userService.partialUpdateUser(userId, userField);
      return res
        .status(201)
        .json({ message: "user updated successfully", success: true });
    } catch (error: any) {
      const statusCode = error.statusCode ?? 500;
      logger.error("this is an updateUser error ", error.message, error.stack);
      res
        .status(statusCode)
        .json({ message: "internal server error", success: false });
    }
  }
}

export const userController = new UserController();
