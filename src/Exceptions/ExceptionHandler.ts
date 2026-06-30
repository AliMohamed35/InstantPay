import type { NextFunction, Request, Response } from "express";
import logger from "../utilities/logger/winston.ts";
import {
  BadRequestException,
  UserAlreadyActiveException,
  UserAlreadyExistException,
  UserNotFoundException,
} from "./CustomExceptions/Exceptions.ts";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    logger.error(`Error after response ${error.name}: ${error.message}`);
    return next(error);
  }

  if (error instanceof UserAlreadyExistException) {
    return res.status(400).json({
      message: "User Already Exist",
      success: false,
      error: error.message,
    });
  }

  if (error instanceof UserNotFoundException) {
    return res.status(404).json({
      message: "User not found!",
      success: false,
      error: error.message,
    });
  }

  if (error instanceof UserAlreadyActiveException) {
    return res.status(404).json({
      message: "Already logged in!",
      success: false,
      error: error.message,
    });
  }
  
  if (error instanceof BadRequestException) {
    return res.status(404).json({
      message: "User Already logged out!",
      success: false,
      error: error.message,
    });
  }
};
