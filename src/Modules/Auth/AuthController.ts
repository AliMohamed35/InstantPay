import type { NextFunction, Request, Response } from "express";
import logger from "../../utilities/logger/winston.ts";
import type { RegisterDTO } from "./dto/RegisterDTO.ts";
import { authService } from "./AuthService.ts";

 class AuthController {
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: RegisterDTO = req.body;
      const createdUser = await authService.register(userData);

      return res
        .status(201)
        .send({
          success: true,
          message: "User created successfully",
          data: createdUser,
        });
    } catch (error) {
      logger.error("this is Auth controller error: ", error);
      return res
        .status(500)
        .send({ success: false, message: "Internal server error" });
    }
  }
}

export const authController = new AuthController();
