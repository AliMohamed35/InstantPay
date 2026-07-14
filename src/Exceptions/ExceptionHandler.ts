import type { NextFunction, Request, Response } from "express";
import logger from "../utilities/logger/winston.ts";

interface HttpError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  error: HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    logger.error(`Error after response ${error.name}: ${error.message}`);
    return next(error);
  }

  const statusCode = error.statusCode ?? 500;

  if (statusCode >= 500) {
    logger.error(
      `${req.method} ${req.originalUrl} -> ${statusCode}: ${error.stack ?? error.message}`,
    );
  } else {
    logger.warn(
      `${req.method} ${req.originalUrl} -> ${statusCode}: ${error.message}`,
    );
  }
    return res.status(statusCode).json({
      success: false,
      message: statusCode >= 500 ? "Internal server error" : error.message,
    });
  }

