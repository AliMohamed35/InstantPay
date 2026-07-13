import type { NextFunction, Request, Response } from "express";
import Joi, { type ObjectSchema } from "joi";
import type { RegisterDTO } from "../Modules/Auth/dto/RegisterDTO.ts";
import type { resendDTO, VerifyDTO } from "../Modules/Auth/dto/VerifyDTO.ts";
import type { ResetPassword } from "../Modules/User/dto/ResetPasswordDTO.ts";
import type { UpdateUserDTO } from "../Modules/User/dto/updateDTO.ts";
import logger from "../utilities/logger/winston.ts";

export const validate = (
  schema: ObjectSchema,
  property: "body" | "params" | "query" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: true,
    });

    if (error) {
      const errors = error.details.map((d) => d.message);
      logger.warn(
        `Validation error on ${req.method} ${req.originalUrl}: ${errors.join("; ")}`,
      );
      return res.status(400).json({
        success: false,
        message: "Validation Error!",
        errors,
      });
    }

    req[property] = value;
    next();
  };
};

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

export const registerSchema = Joi.object<RegisterDTO>({
  firstName: name,
  lastName: name,
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{7,14}$/)
    .messages({
      "string.pattern.base": "Phone must be a valid international number",
    })
    .required(),
  email: email,
  password: password,
  pin: Joi.string().pattern(new RegExp("^[0-9]{3,5}$")).required(),
});

export const loginSchema = Joi.object<RegisterDTO>({
  email: email,
  password: password,
});

export const verifySchema = Joi.object<VerifyDTO>({
  email: email,
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

export const resendOTPSchema = Joi.object<resendDTO>({
  email: email,
});

export const resetPasswordSchema = Joi.object<ResetPassword>({
  oldPassword: password,
  newPassword: password,
});

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
