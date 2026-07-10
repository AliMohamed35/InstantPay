import { Router } from "express";
import { userController } from "./userController.ts";
import { auth } from "../../middlewares/authenticate.ts";
import { validate } from "../../middlewares/joi.ts";
import * as joiContent from "../../middlewares/joi.ts";
import { authorizeSelf } from "../../middlewares/authorization.ts";

const userRouter = Router();

// Protected
userRouter.post(
  "/reset-password",
  auth,
  validate(joiContent.resetPasswordSchema),
  userController.changePassword,
);
userRouter.post(
  "/:userId",
  auth,
  authorizeSelf("userId"),
  userController.softDeleteUser,
);
userRouter.delete(
  "/:userId",
  auth,
  authorizeSelf("userId"),
  userController.deleteUser,
);

userRouter.get("/:userId", auth, userController.getSpecificUser);
userRouter.put(
  "/:userId",
  auth,
  validate(joiContent.updateUserSchema),
  userController.updateUser,
);

userRouter.patch(
  "/:userId",
  auth,
  validate(joiContent.partialUpdateSchema),
  userController.partialUpdateUser,
);

export default userRouter;
