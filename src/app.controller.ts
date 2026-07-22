import type { Application, NextFunction, Request, Response } from "express";
import authRouter from "./Modules/Auth/auth.routes.ts";
import userRouter from "./Modules/User/user.routes.ts";
import sequelize, { connectDB } from "./DB/connection.ts";
import "./DB/Models/index.ts";
import cookieParser from "cookie-parser";
import { errorHandler } from "./Exceptions/ExceptionHandler.ts";
import accountRouter from "./Modules/Accounts/account.routes.ts";

async function bootstrap(app: Application, express: any): Promise<void> {
  app.use(express.json());

  app.use(cookieParser());

  await connectDB();

  if (process.env.NODE_ENV !== "production") {
    await sequelize.sync();
  }

  app.get("/health", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: "healthy", timestamp: Date.now() });
  });

  // routes
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/account", accountRouter);

  // centralized error handling
  app.use(errorHandler);
}

export default bootstrap;
