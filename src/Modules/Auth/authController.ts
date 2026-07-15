import type { NextFunction, Request, Response } from "express";
import { authService } from "./authService.ts";
import type { RegisterDTO, RegisterResponseDTO } from "./dto/RegisterDTO.ts";
import { ApiResponse } from "../../utilities/apiResponse.ts";

const isProd = process.env.NODE_ENV === "production";
const ACCESS_COOKIE_MS = 15 * 60 * 1000;
const REFRESH_COOKIE_MS = 7 * 24 * 60 * 60 * 1000;

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: ACCESS_COOKIE_MS,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: REFRESH_COOKIE_MS,
    });
}

function clearAuthCookies(res: Response) {
  res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
    });
}

class AuthController {
  public async register(req: Request, res: Response, next: NextFunction) {
    const userData: RegisterDTO = req.body;
    const createdUserDTO: RegisterResponseDTO =
      await authService.register(userData);

    return ApiResponse.sendSuccess(
      res,
      createdUserDTO,
      "User created successfully",
      201,
    );
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    const { accessToken, refreshToken, userId } = await authService.login(
      req.body,
    );
    setAuthCookies(res, accessToken, refreshToken);

    return ApiResponse.sendSuccess(
      res,
      userId,
      "User logged in successfully",
      200,
    );
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.userId;
    const loggedOutUser = await authService.logout(userId);

    clearAuthCookies(res);

    return ApiResponse.sendSuccess(
      res,
      loggedOutUser,
      "User logged out successfully",
      200,
    );
  }

  public async refresh(req: Request, res: Response, next: NextFunction) {
    const { accessToken, refreshToken } = await authService.refresh(
      req.cookies?.refreshToken,
    );
    setAuthCookies(res, accessToken, refreshToken);
    return ApiResponse.sendSuccess(
      res,
      "ok",
      "Token refreshed successfully",
      200,
    );
  }

  public async verifyOTP(req: Request, res: Response, next: NextFunction) {
    const { email, otp } = req.body;
    const verifiedUser = await authService.verifyOTP(email, otp);

    return ApiResponse.sendSuccess(
      res,
      verifiedUser,
      "User Verified successfully",
      200,
    );
  }

  public async resendOTP(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    await authService.resendOTP(email);

    return ApiResponse.sendSuccess(
      res,
      "ok",
      "New OTP has been sent check your email",
      200,
    );
  }
}

export const authController = new AuthController();
