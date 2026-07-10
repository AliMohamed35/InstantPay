import type { NextFunction, Request, Response } from "express";
import Joi, { type ObjectSchema } from "joi";
import type { RegisterDTO } from "../Modules/Auth/dto/RegisterDTO.ts";
import type { resendDTO, VerifyDTO } from "../Modules/Auth/dto/VerifyDTO.ts";
import logger from "../utilities/logger/winston.ts";
import type { ResetPassword } from "../Modules/User/dto/ResetPasswordDTO.ts";
import type {
  PartialUpdateDTO,
  UpdateUserDTO,
} from "../Modules/User/dto/updateDTO.ts";

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

export const registerSchema = Joi.object<RegisterDTO>({
  firstName: Joi.string().alphanum().min(3).max(30).required(),
  lastName: Joi.string().alphanum().min(3).max(30).required(),
  phoneNumber: Joi.string().alphanum().min(11).max(30).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .min(11)
    .max(30)
    .required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  pin: Joi.string().pattern(new RegExp("^[0-9]{3,5}$")).required(),
});

export const loginSchema = Joi.object<RegisterDTO>({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .min(11)
    .max(30)
    .required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});

export const verifySchema = Joi.object<VerifyDTO>({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .min(11)
    .max(30)
    .required(),
  otp: Joi.number().integer().min(10000).max(99999).required(),
});

export const resendOTPSchema = Joi.object<resendDTO>({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .min(11)
    .max(30)
    .required(),
});

export const resetPasswordSchema = Joi.object<ResetPassword>({
  oldPassword: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .required(),
  newPassword: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .required(),
});

export const updateUserSchema = Joi.object<UpdateUserDTO>({
  firstName: Joi.string().alphanum().min(3).max(30).required(),
  lastName: Joi.string().alphanum().min(3).max(30).required(),
  phoneNumber: Joi.string().alphanum().min(11).max(30).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .min(11)
    .max(30)
    .required(),
});

export const partialUpdateSchema = updateUserSchema
  .fork(["firstName", "lastName", "phoneNumber", "email"], (field) =>
    field.optional(),
  )
  .min(1);
