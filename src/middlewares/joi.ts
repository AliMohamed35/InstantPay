import type { NextFunction, Request, Response } from "express";
import { type ObjectSchema } from "joi";
import logger from "../utilities/logger/winston.ts";

export const validate = (
  schema: ObjectSchema,
  property: "body" | "params" | "query" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: true,
      allowUnknown: false,
      stripUnknown: false,
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

