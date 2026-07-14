import type { NextFunction, Request, Response } from "express";
import logger from "../../utilities/logger/winston.ts";
import type { RegisterDTO, RegisterResponseDTO } from "./dto/RegisterDTO.ts";
import { authService } from "./authService.ts";

class AuthController {
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: RegisterDTO = req.body;
      const createdUserDTO: RegisterResponseDTO =
        await authService.register(userData);

      return res.status(201).send({
        success: true,
        message: "User created successfully",
        data: createdUserDTO,
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
          secure: true
        })
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          secure: true
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
      const userId = req.user?.userId;
      const loggedOutUser = await authService.logout(userId);

      res
        .clearCookie("accessToken", { httpOnly: true, sameSite: "strict" })
        .clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });

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
}

export const authController = new AuthController();
