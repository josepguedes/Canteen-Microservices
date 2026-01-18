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

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  logger.info(`[UserController] DELETE /users/${id} - Request to delete user`);
  
  if (!id) {
    logger.warn("[UserController] User ID is missing");
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "User ID is required",
    });
  }
  
  const deletedUser = await UserService.deleteUser(id);
  
  logger.info(`[UserController] Successfully deleted user with ID: ${id}`);
  
  res.status(HttpStatusCode.OK).json({
    success: true,
    message: "User deleted successfully",
    data: deletedUser,
  });
});