import type { NextFunction, Request, Response } from "express";
import { generateAccessToken, verifyToken } from "../utilities/jwt/jwt.ts";
import logger from "../utilities/logger/winston.ts";

export function auth(req: Request, res: Response, next: NextFunction) {
  const accessToken =
    req.cookies?.accessToken ??
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : undefined);

  // happy path, when the accessToken is valid only.
  if (accessToken) {
    try {
      req.user = verifyToken(accessToken);
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
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({
      message: "Invalid or expired token, Please login again!",
      success: false,
    });
  }

  try {
    const verifiedToken = verifyToken(refreshToken);
    const newAccessToken = generateAccessToken(verifiedToken.userId);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    req.user = verifiedToken;
    return next();
  } catch (error: any) {
    logger.warn(`refresh failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: "Session expired, Please login again!",
    });
  }
}
