import type { Application, NextFunction, Request, Response } from "express";
import authRouter from "./Modules/Auth/auth.routes.ts";
import sequelize, { connectDB } from "./DB/connection.ts";
import "./DB/Models/index.ts";

async function bootstrap(app: Application, express: any): Promise<void> {
  app.use(express.json());

  await connectDB();

  await sequelize.sync();

  app.get("/health", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: "healthy", timestamp: Date.now() });
  });
  
  // routes
  app.use("/auth", authRouter);
}

export default bootstrap;