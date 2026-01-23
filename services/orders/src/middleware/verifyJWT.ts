import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import AppError from "../utils/AppError";
import AppErrorCode from "../constants/appErrorCode";
import * as HttpStatusCode from "../constants/httpStatusCode";
dotenv.config();

// Local interface for request with user
interface AuthRequest extends Request {
  userId?: string | JwtPayload;
}

const verifyJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return next(
      new AppError(
        "Session invalid or expired",
        HttpStatusCode.UNAUTHORIZED,
        AppErrorCode.InvalidAccessToken
      )
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(
      new AppError(
        "Token missing from Authorization header",
        HttpStatusCode.UNAUTHORIZED,
        AppErrorCode.InvalidAccessToken
      )
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.userId = decoded.id;
    next();
  } catch (err) {
    return next(
      new AppError(
        "Session invalid or expired",
        HttpStatusCode.UNAUTHORIZED,
        AppErrorCode.InvalidAccessToken
      )
    );
  }
};

export default verifyJWT;
