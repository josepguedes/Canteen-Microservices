import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import * as HttpStatusCode from "../constants/httpStatusCode";
import logger from "../utils/logger";

interface PostgresError {
  code?: string;
  message?: string;
  detail?: string;
  hint?: string;
  stack?: string;
}

function isPostgresError(error: unknown): error is PostgresError {
  return typeof error === "object" && error !== null && "code" in error;
}

const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    logger.warn(
      {
        statusCode: error.statusCode,
        errorCode: error.errorCode,
        message: error.message,
      },
      "Application error"
    );
    return res.status(error.statusCode).json({
      errorCode: error.errorCode,
      message: error.message,
    });
  }

  if (isPostgresError(error)) {
    logger.error(
      {
        code: error.code,
        message: error.message,
        detail: error.detail,
        hint: error.hint,
        stack: error.stack,
      },
      "Postgres error"
    );
  }

  logger.error(error, "Unexpected error");

  return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    message: "Something went wrong",
  });
};

export default errorHandler;
