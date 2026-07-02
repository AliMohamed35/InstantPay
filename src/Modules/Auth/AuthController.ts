import type { NextFunction, Request, Response } from "express";
import logger from "../../utilities/logger/winston.ts";
import type { RegisterDTO } from "./dto/RegisterDTO.ts";
import { authService } from "./AuthService.ts";

class AuthController {
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: RegisterDTO = req.body;
      const createdUser = await authService.register(userData);

      return res.status(201).send({
        success: true,
        message: "User created successfully",
        data: createdUser,
      });
    } catch (error: any) {
      logger.error(
        `Auth controller register error: ${error.stack ?? error.message ?? error}`,
      );
      const status = error.statusCode ?? 500;
      return res.status(status).send({
        success: false,
        message: error.statusCode ? error.message : "Internal server error",
      });
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken, userId } = await authService.login(
        req.body,
      );

      res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: { userId },
      });
    } catch (error: any) {
      logger.error(
        `Auth controller login error: ${error.stack ?? error.message ?? error}`,
      );
      const status = error.statusCode ?? 500;
      return res.status(status).send({
        success: false,
        message: error.statusCode ? error.message : "Internal server error",
      });
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const loggedOutUser = await authService.logout(email);
      return res.status(200).json({
        message: "User logged out successfully",
        success: true,
        data: loggedOutUser,
      });
    } catch (error: any) {
      logger.error(
        `Auth controller logout error: ${error.stack ?? error.message ?? error}`,
      );
      return res.status(500).json({ message: error.message, success: false });
    }
  }

  public async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const verifiedUser = await authService.verifyOTP(email, otp);

      return res.status(200).json({
        message: "User verified out successfully",
        success: true,
        data: verifiedUser,
      });
    } catch (error: any) {
      logger.error(
        `Auth controller verifyOTP error: ${error.stack ?? error.message ?? error}`,
      );
      return res.status(500).json({ message: error.message, success: false });
    }
  }

  public async resendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.resendOTP(email);

      res.status(201).json({ message: "new OTP sent!", success: true });
    } catch (error: any) {
      const statusCode = error.statusCode ?? 500;
      logger.error("this is an authController error: " + `${error}`);
      res.status(statusCode).json({
        message: "internal server error",
        success: false,
        error: error.message,
      });
    }
  }

  public async softDeleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.softDeleteUser(email);

      res.status(201).json({ message: "user soft deleted!", success: true });
    } catch (error: any) {
      const statusCode = error.statusCode ?? 500;
      logger.error("this is an authController error: " + `${error}`);
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
      await authService.deleteUser(userId);
      res.clearCookie("accessToken").clearCookie("refreshToken");

      return res
        .status(201)
        .json({ message: "user deleted! successfully", success: true });
    } catch (error: any) {
      const statusCode = error.statusCode ?? 500;
      logger.error("this is an authController error: " + `${error}`);
      res.status(statusCode).json({
        message: "internal server error",
        success: false,
        error: error.message,
      });
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, oldPassword, newPassword } = req.body;
      const updatedUser = await authService.changePassword(
        email,
        oldPassword,
        newPassword,
      );

      return res.status(200).json({
        message: "user password changed successfully",
        success: true,
        data: updatedUser,
      });
    } catch (error: any) {
      const statusCode = error.statusCode ?? 500;
      logger.error(
        `Auth controller change password error: ${error.stack ?? error.message ?? error}`,
      );
      res.status(statusCode).json({
        message: "internal server error",
        success: false,
        error: error.message,
      });
    }
  }
}

export const authController = new AuthController();
