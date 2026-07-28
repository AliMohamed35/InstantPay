import { Router } from "express";
import { auth } from "../../middlewares/authenticate.ts";
import { asyncHandler } from "../../middlewares/asyncHandler.ts";
import { transactionController } from "./transactions.controller.ts";

const transactionRouter = Router();

// GET /transactions/:id/history?page=1&limit=20
transactionRouter.get(
  "/:id/history",
  auth,
  asyncHandler(transactionController.getAccountHistory),
);

export default transactionRouter;
