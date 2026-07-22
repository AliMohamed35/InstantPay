import Joi from "joi";
import type { ResetPassword } from "../dto/ResetPasswordDTO.ts";
import type { UpdateUserDTO } from "../dto/updateDTO.ts";

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

export const resetPasswordSchema = Joi.object<ResetPassword>({
  oldPassword: password,
  newPassword: password,
});
