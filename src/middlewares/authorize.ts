import type { NextFunction, Request, Response } from "express";

export const authorizeSelf = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }

  const targetUserId = req.params.userId ?? req.body.userId;
  if (req.user.userId === targetUserId) {
    return next();
  }
  return res
    .status(403)
    .json({ success: false, message: "Forbidden: not your account" });
};
