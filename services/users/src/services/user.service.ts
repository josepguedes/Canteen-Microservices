import * as UserModel from "../models/user.model";
import logger from "../utils/logger";
import AppError from "../utils/AppError";
import * as HttpStatusCode from "../constants/httpStatusCode";
import argon2 from "argon2";

export const getAllUsers = async () => {
  logger.info("[UserService] Getting all users");

  const users = await UserModel.getAllUsers();

  if (!users || users.length === 0) {
    logger.info("[UserService] No users found in database");
    return [];
  }

  logger.info(`[UserService] Successfully retrieved ${users.length} users`);
  return users;
};

export const createUser = async (
  email: string,
  name: string,
  password: string,
) => {
  logger.info(`[UserService] Creating user with email: ${email}`);

  if (!email || !name || !password) {
    logger.warn("[UserService] Missing required fields for user creation");
    throw new AppError(
      "Email, name, and password are required",
      HttpStatusCode.BAD_REQUEST,
    );
  }

  const hashedPassword = await argon2.hash(password);

  const createdUser = await UserModel.createUser(email, name, hashedPassword);

  logger.info(
    `[UserService] Successfully created user with ID: ${createdUser.id}`,
  );
  return createdUser;
};

export const deleteUser = async (userId: string) => {
  logger.info(`[UserService] Deleting user with ID: ${userId}`);

  const deletedUser = await UserModel.deleteUser(userId);

  if (!deletedUser) {
    logger.warn(`[UserService] User with ID ${userId} not found`);
    throw new AppError("User not found", HttpStatusCode.NOT_FOUND);
  }

  logger.info(`[UserService] Successfully deleted user with ID: ${userId}`);
  return deletedUser;
};
