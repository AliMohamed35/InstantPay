import { Router } from "express";
import { authController } from "./AuthController.ts";
import { userSchema, validate } from "../../middlewares/joi.ts";

const authRouter = Router();

authRouter.post("/register", validate(userSchema),authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/verify", authController.verifyOTP);

export default authRouter;