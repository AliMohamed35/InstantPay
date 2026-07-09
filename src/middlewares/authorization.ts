import type { NextFunction, Request, Response } from "express";
import logger from "../utilities/logger/winston.ts";

export function authorizeSelf(paramKey: string = "userId") {
  return (req: Request, res: Response, next: NextFunction) => {
    const loggedInUser = req.user?.userId;
    const targetUserId = req.params[paramKey];

    if (!loggedInUser) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required!" });
    }

    if (loggedInUser !== targetUserId) {
      logger.warn(
        `authorization blocked: ${loggedInUser} tried to access ${targetUserId}`,
      );
      return res.status(403).json({
        success: false,
        message: "You are not allowed to perform this action",
      });
    }

    next();
  };
}
