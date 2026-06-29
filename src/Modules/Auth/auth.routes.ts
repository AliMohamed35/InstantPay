import { Router } from "express";
import { authController } from "./AuthController.ts";

const authRouter = Router();

authRouter.post("/register", authController.register);

export default authRouter;