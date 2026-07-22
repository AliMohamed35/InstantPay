import { Router } from "express";
import { auth } from "../../middlewares/authenticate.ts";
import { accountController } from "./accountController.ts";
import { asyncHandler } from "../../middlewares/asyncHandler.ts";
import { validate } from "../../middlewares/joi.ts";
import { createAccountSchema } from "./validate/accountValidate.ts";

export const accountRouter = Router();

accountRouter.get(
  "/accounts",
  auth,
  asyncHandler(accountController.listAccounts),
);
accountRouter.get("/:id", auth, asyncHandler(accountController.getAccount));
accountRouter.get(
  "/",
  auth,
  asyncHandler(accountController.getAccountByNumber),
);


// Protected
accountRouter.post(
  "/add",
  auth,
  validate(createAccountSchema),
  asyncHandler(accountController.addAccount),
);
accountRouter.delete(
  "/:id",
  auth,
  asyncHandler(accountController.removeAccount),
);

export default accountRouter;
