import { Router } from "express";
import { authController } from "./authController.ts";
import * as joiContent from "../../middlewares/joi.ts";
import { auth } from "../../middlewares/authenticate.ts";
import { authLimiter, otpLimiter } from "../../middlewares/rateLimit.ts";

const authRouter = Router();

authRouter.post(
  "/register",
  joiContent.validate(joiContent.registerSchema),
  authController.register,
);
authRouter.post(
  "/login",
  authLimiter,
  joiContent.validate(joiContent.loginSchema),
  authController.login,
);
authRouter.post(
  "/verify",
  otpLimiter,
  joiContent.validate(joiContent.verifySchema),
  authController.verifyOTP,
);
authRouter.post(
  "/otp",
  otpLimiter,
  joiContent.validate(joiContent.resendOTPSchema),
  authController.resendOTP,
);
authRouter.post("/refresh", authLimiter, authController.refreshToken);

// Protected
authRouter.post("/logout", auth, authController.logout);

export default authRouter;
