import Joi, { type ObjectSchema } from "joi";
import type { RegisterDTO } from "../Modules/Auth/dto/RegisterDTO.ts";
import type { Request, Response, NextFunction } from "express";
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
      logger.warn(`Validation error on ${req.method} ${req.originalUrl}: ${errors.join("; ")}`);
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation Error!",
          errors,
        });
    }

    req[property] = value;
    next();
  };
};

export const userSchema = Joi.object<RegisterDTO>({
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
