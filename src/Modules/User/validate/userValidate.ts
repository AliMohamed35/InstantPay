import Joi from "joi";
import type { ResetPassword } from "../dto/ResetPasswordDTO.ts";
import type {
  TransferAccountNumberDTO,
  TransferDTO,
} from "../dto/transferDTO.ts";
import type { UpdateUserDTO } from "../dto/updateDTO.ts";
import { accountNumber } from "../../Accounts/validate/accountValidate.ts";

const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[a-z]/)
  .pattern(/[A-Z]/)
  .pattern(/\d/)
  .pattern(/[^A-Za-z0-9]/)
  .messages({
    "string.pattern.base": "Password needs upper, lower, number, and symbol",
  })
  .required();

const email = Joi.string()
  .email({ minDomainSegments: 2 })
  .max(254)
  .lowercase()
  .required();

const phoneNumber = Joi.string()
  .pattern(/^\+?[1-9]\d{7,14}$/)
  .messages({
    "string.pattern.base": "Phone must be a valid international number",
  })
  .required();

const name = Joi.string().trim().min(1).max(50).required();

export const updateUserSchema = Joi.object<UpdateUserDTO>({
  firstName: name,
  lastName: name,
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{7,14}$/)
    .messages({
      "string.pattern.base": "Phone must be a valid international number",
    })
    .required(),
  email: email,
});

export const partialUpdateSchema = updateUserSchema
  .fork(["firstName", "lastName", "phoneNumber", "email"], (field) =>
    field.optional(),
  )
  .min(1);

export const changePasswordSchema = Joi.object<ResetPassword>({
  oldPassword: password,
  newPassword: password,
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .max(254)
    .lowercase()
    .required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .max(254)
    .lowercase()
    .required(),
  otp: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required(),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/[a-z]/)
    .pattern(/[A-Z]/)
    .pattern(/\d/)
    .pattern(/[^A-Za-z0-9]/)
    .messages({
      "string.pattern.base": "Password needs upper, lower, number, and symbol",
    })
    .required(),
});

export const transferSchema = Joi.object<TransferDTO>({
  senderAccountId: Joi.string().uuid().required(),
  receiverAccountId: Joi.string()
    .uuid()
    .required()
    .invalid(Joi.ref("senderAccountId"))
    .messages({ "any invalid": "Cannot transfer to the same account" }),
  amount: Joi.number()
    .positive()
    .precision(4)
    .required()
    .messages({ "number.positive": "Amount must be positive" }),

  pin: Joi.string()
    .pattern(/^[0-9]{3,5}$/)
    .required(),
});

export const transferAccountNumberSchema = Joi.object<TransferAccountNumberDTO>(
  {
    senderAccountNumber: accountNumber,
    receiverAccountNumber: accountNumber,
    amount: Joi.number()
      .positive()
      .precision(4)
      .required()
      .messages({ "number.positive": "Amount must be positive" }),

    pin: Joi.string()
      .pattern(/^[0-9]{3,5}$/)
      .required(),
  },
);

export const pinSchema = Joi.object<TransferDTO>({
  pin: Joi.string()
    .pattern(/^[0-9]{3,5}$/)
    .required(),
});
