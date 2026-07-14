import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.ts";
import { auth } from "../../middlewares/authenticate.ts";
import * as joiContent from "../../middlewares/joi.ts";
import { validate } from "../../middlewares/joi.ts";
import { userController } from "./userController.ts";

const userRouter = Router();

// Protected
userRouter.post(
  "/reset-password",
  auth,
  validate(joiContent.resetPasswordSchema),
  asyncHandler(userController.changePassword),
);
userRouter.post("/", auth, asyncHandler(userController.softDeleteUser));

userRouter.get("/", auth, asyncHandler(userController.getSpecificUser));

userRouter.put(
  "/",
  auth,
  validate(joiContent.updateUserSchema),
  asyncHandler(userController.updateUser),
);

userRouter.patch(
  "/",
  auth,
  validate(joiContent.partialUpdateSchema),
  asyncHandler(userController.partialUpdateUser),
);

export default userRouter;
