import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.ts";
import { auth } from "../../middlewares/authenticate.ts";
import * as userValidate from "../User/validate/userValidate.ts";
import { validate } from "../../middlewares/joi.ts";
import { userController } from "./user.controller.ts";
import { otpLimiter } from "../../middlewares/rateLimit.ts";

const userRouter = Router();

// Protected
userRouter.post(
  "/change-password",
  auth,
  validate(userValidate.changePasswordSchema),
  asyncHandler(userController.changePassword),
);

// Forget password
userRouter.post(
  "/forgot-password",
  otpLimiter,
  validate(userValidate.forgotPasswordSchema),
  asyncHandler(userController.forgetPassword),
);

userRouter.post(
  "/reset-password",
  otpLimiter,
  validate(userValidate.resetPasswordSchema),
  asyncHandler(userController.resetPassword),
);
userRouter.post("/", auth, asyncHandler(userController.softDeleteUser));

userRouter.get("/", auth, asyncHandler(userController.getSpecificUser));

userRouter.put(
  "/",
  auth,
  validate(userValidate.updateUserSchema),
  asyncHandler(userController.updateUser),
);

userRouter.patch(
  "/",
  auth,
  validate(userValidate.partialUpdateSchema),
  asyncHandler(userController.partialUpdateUser),
);

userRouter.post(
  "/transfer",
  auth,
  validate(userValidate.transferSchema),
  asyncHandler(userController.transferToUser),
);

userRouter.post(
  "/:id",
  auth,
  validate(userValidate.pinSchema),
  asyncHandler(userController.checkBalance),
);

userRouter.post("/recharge/:id", auth, asyncHandler(userController.recharge));

export default userRouter;
