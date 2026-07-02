import { Router } from "express";
import { authController } from "./AuthController.ts";
import { userSchema, validate } from "../../middlewares/joi.ts";
import { auth } from "../../middlewares/authenticate.ts";

const authRouter = Router();

authRouter.post("/register", validate(userSchema), authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/verify", authController.verifyOTP);
authRouter.post("/otp", authController.resendOTP);

// Protected
authRouter.post("/logout", auth, authController.logout);
authRouter.post("/reset-password", auth, authController.changePassword);
authRouter.post("/delete", auth, authController.softDeleteUser);
authRouter.delete("/delete", auth, authController.deleteUser);

export default authRouter;
