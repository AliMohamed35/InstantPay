import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utilities/jwt/jwt.ts";

// Token Rotation mechanism
export async function auth(req: Request, res: Response, next: NextFunction) {
  const token =
    req.cookies?.accessToken ??
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : undefined);

  if (!token) {
    return res
      .status(401)
      .json({ success: false, code: "NO_TOKEN", message: "Login required" });
  }
  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return res
      .status(401)
      .json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Token expired",
      });
  }
}
