import { Router } from "express";
import { authController } from "./authController.ts";
import { validate } from "../../middlewares/joi.ts";
import { auth } from "../../middlewares/authenticate.ts";
import { authLimiter, otpLimiter } from "../../middlewares/rateLimit.ts";
import { asyncHandler } from "../../middlewares/asyncHandler.ts";
import { loginSchema, registerSchema, resendOTPSchema, verifySchema } from "./validate/authValidate.ts";

const authRouter = Router();

authRouter.post(
  "/register",
  validate(registerSchema),
  asyncHandler(authController.register),
);
authRouter.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  asyncHandler(authController.login),
);
authRouter.post(
  "/verify",
  otpLimiter,
  validate(verifySchema),
  asyncHandler(authController.verifyOTP),
);
authRouter.post(
  "/otp",
  otpLimiter,
  validate(resendOTPSchema),
  asyncHandler(authController.resendOTP),
);
authRouter.post("/refresh", asyncHandler(authController.refresh));

// Protected
authRouter.post("/logout", auth, asyncHandler(authController.logout));

export default authRouter;
