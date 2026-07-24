import Joi from "joi";
import type { addAccountDTO } from "../dto/addAccountDTO.ts";

export const accountNumber = Joi.string()
  .pattern(/^\d{4}-\d{4}-\d{4}-\d{4}$/)
  .messages({
    "string.pattern.base":
      "Account number must be is the format xxxx-xxxx-xxxx-xxxx",
  })
  .required();

export const createAccountSchema = Joi.object<addAccountDTO>({
  accountNumber,
  type: Joi.string().valid("BANK_ACCOUNT", "WALLET").required(),
  currency: Joi.string().uppercase().valid("EGP", "USD").default("EGP"),
});
