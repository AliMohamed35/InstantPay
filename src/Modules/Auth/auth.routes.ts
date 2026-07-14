import { Router } from "express";
import { authController } from "./authController.ts";
import * as joiContent from "../../middlewares/joi.ts";
import { auth } from "../../middlewares/authenticate.ts";
import { authLimiter, otpLimiter } from "../../middlewares/rateLimit.ts";
import { asyncHandler } from "../../middlewares/asyncHandler.ts";

const authRouter = Router();

authRouter.post(
  "/register",
  joiContent.validate(joiContent.registerSchema),
  asyncHandler(authController.register),
);
authRouter.post(
  "/login",
  authLimiter,
  joiContent.validate(joiContent.loginSchema),
  asyncHandler(authController.login),
);
authRouter.post(
  "/verify",
  otpLimiter,
  joiContent.validate(joiContent.verifySchema),
  asyncHandler(authController.verifyOTP),
);
authRouter.post(
  "/otp",
  otpLimiter,
  joiContent.validate(joiContent.resendOTPSchema),
  asyncHandler(authController.resendOTP),
);
authRouter.post("/refresh", asyncHandler(authController.refresh));

// Protected
authRouter.post("/logout", auth, asyncHandler(authController.logout));

export default authRouter;
