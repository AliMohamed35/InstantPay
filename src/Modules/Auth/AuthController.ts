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
      // get data from body
      const loginData = req.body;
      const loggedUser = await authService.login(loginData);

      res.status(200).json({
        message: "User logged in successfully",
        success: true,
        data: loggedUser,
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
}

export const authController = new AuthController();
