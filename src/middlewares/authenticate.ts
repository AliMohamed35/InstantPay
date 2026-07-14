import type { NextFunction, Request, Response } from "express";
import { authRepository } from "../Modules/Auth/authRepository.ts";
import { compareRefresh } from "../utilities/bcrypt/bcrypt.ts";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utilities/jwt/jwt.ts";
import logger from "../utilities/logger/winston.ts";

// Token Rotation mechanism
export async function auth(req: Request, res: Response, next: NextFunction) {
  const accessToken =
    req.cookies?.accessToken ??
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : undefined);

  // happy path, when the accessToken is valid only.
  if (accessToken) {
    try {
      req.user = verifyAccessToken(accessToken);
      return next();
    } catch (error: any) {
      if (error.name !== "TokenExpiredError") {
        logger.warn(`authenticate failed: ${error.message}`);
        return res
          .status(401)
          .json({ success: false, message: "Invalid or expired token" });
      }
    }
  }

  // if no accessToken or expired or whatever, move on to the refreshToken
  // need to check isActive, isDeleted and softDeleted
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token, please login again!" });
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error: any) {
    logger.warn(`refresh failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: "Session expired, Please login again!",
    });
  }

  const userExist = await authRepository.findById(payload.userId);

  if (!userExist)
    return res.status(404).json({ success: false, message: "User Not Found!" });

  if (userExist.isDeleted)
    return res.status(401).json({
      success: false,
      message: "User is deleted login again to retrieve account!",
    });

  const verifiedToken = userExist.refreshToken
    ? await compareRefresh(refreshToken, userExist.refreshToken)
    : false;

  if (!verifiedToken) {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token, please login again!",
    });
  }

  const newAccessToken = generateAccessToken(userExist.userId);
  const newRefreshToken = generateRefreshToken(userExist.userId);

  await authRepository.update(
    { refreshToken: newRefreshToken },
    { where: { userId: userExist.userId } },
  );

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  req.user = { userId: userExist.userId, type: "access" };
  return next();
}
