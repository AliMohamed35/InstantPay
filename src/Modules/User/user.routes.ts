import { Router } from "express";
import { userController } from "./UserController.ts";
import { auth } from "../../middlewares/authenticate.ts";
import { validate } from "../../middlewares/joi.ts";
import * as joiContent from "../../middlewares/joi.ts";


const userRouter = Router();

// Protected
userRouter.post("/reset-password", auth, validate(joiContent.resetPasswordSchema), userController.changePassword);
userRouter.post("/delete", auth, userController.softDeleteUser);
userRouter.delete("/delete", auth, userController.deleteUser);

export default userRouter;
