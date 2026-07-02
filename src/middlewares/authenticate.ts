import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utilities/jwt/jwt.ts";
import logger from "../utilities/logger/winston.ts";

export function auth(req: Request, res: Response, next: NextFunction) {
  const token =
    req.cookies?.accessToken ??
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : undefined);

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required!" });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error: any) {
    logger.warn(`authenticate failed: ${error.message}`);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}
