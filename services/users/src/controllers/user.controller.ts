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

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  logger.info(
    `[UserController] POST /users - Request to create user with email: ${email}`,
  );

  if (!email || !name || !password) {
    logger.warn("[UserController] Missing required fields in request body");
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "Email, name, and password are required",
    });
  }

  const createdUser = await UserService.createUser(email, name, password);

  logger.info(
    `[UserController] Successfully created user with ID: ${createdUser.id}`,
  );

  res.status(HttpStatusCode.CREATED).json({
    success: true,
    message: "User created successfully",
    data: createdUser,
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

export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  logger.info(
    `[UserController] POST /login - Request to login with email: ${email}`,
  );

  if (!email || !password) {
    logger.warn("[UserController] Missing email or password in request body");
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const result = await UserService.loginUser(email, password);

  logger.info(
    `[UserController] Successfully logged in user with ID: ${result.id}`,
  );

  res.status(HttpStatusCode.OK).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, name } = req.body;

  logger.info(`[UserController] PUT /users/${id} - Request to update user`);

  if (!id) {
    logger.warn("[UserController] User ID is missing");
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (!email && !name) {
    logger.warn(
      "[UserController] No fields provided to update for user ID: " + id,
    );
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "At least one field (email or name) must be provided",
    });
  }

  const updatedUser = await UserService.updateUser(id, email, name);

  logger.info(`[UserController] Successfully updated user with ID: ${id}`);

  res.status(HttpStatusCode.OK).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});
