import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import catchAsync from "../utils/catchAsync";
import logger from "../utils/logger";
import * as HttpStatusCode from "../constants/httpStatusCode";

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  logger.info("[UserController] GET /users - Request to get all users");
  
  const users = await UserService.getAllUsers();
  
  logger.info(`[UserController] Successfully returning ${users.length} users`);
  
  res.status(HttpStatusCode.OK).json({
    success: true,
    count: users.length,
    data: users,
  });
});