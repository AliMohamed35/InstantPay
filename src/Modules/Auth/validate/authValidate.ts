import Joi from "joi";
import type { RegisterDTO } from "../dto/RegisterDTO.ts";
import type { resendDTO, VerifyDTO } from "../dto/VerifyDTO.ts";

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

