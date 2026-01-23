import * as UserModel from "../models/user.model";
import logger from "../utils/logger";
import AppError from "../utils/AppError";
import * as HttpStatusCode from "../constants/httpStatusCode";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

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

export const getUserById = async (userId: string) => {
  logger.info(`[UserService] Getting user with ID: ${userId}`);

  if (!userId) {
    logger.warn("[UserService] Missing userId");
    throw new AppError("User ID is required", HttpStatusCode.BAD_REQUEST);
  }

  const user = await UserModel.getUserById(userId);

  if (!user) {
    logger.warn(`[UserService] User with ID ${userId} not found`);
    throw new AppError("User not found", HttpStatusCode.NOT_FOUND);
  }

  logger.info(`[UserService] Successfully retrieved user with ID: ${userId}`);
  return user;
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

export const loginUser = async (email: string, password: string) => {
  logger.info(`[UserService] Attempting login for user with email: ${email}`);

  if (!email || !password) {
    logger.warn("[UserService] Missing email or password for login");
    throw new AppError(
      "Email and password are required",
      HttpStatusCode.BAD_REQUEST,
    );
  }

  const user = await UserModel.getUserByEmail(email);

  if (!user) {
    logger.warn(`[UserService] User with email ${email} not found`);
    throw new AppError(
      "Invalid email or password",
      HttpStatusCode.UNAUTHORIZED,
    );
  }

  const isPasswordValid = await argon2.verify(user.password, password);

  if (!isPasswordValid) {
    logger.warn(`[UserService] Invalid password for user with email: ${email}`);
    throw new AppError(
      "Invalid email or password",
      HttpStatusCode.UNAUTHORIZED,
    );
  }

  logger.info(`[UserService] Password verified for user with email: ${email}`);

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" },
  );

  logger.info(`[UserService] JWT token generated for user with ID: ${user.id}`);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    token,
  };
};

export const updateUser = async (
  userId: string,
  email?: string,
  name?: string,
) => {
  logger.info(`[UserService] Updating user with ID: ${userId}`);

  if (!email && !name) {
    logger.warn(
      `[UserService] No fields provided to update for user ID: ${userId}`,
    );
    throw new AppError(
      "At least one field (email or name) must be provided",
      HttpStatusCode.BAD_REQUEST,
    );
  }

  const updatedUser = await UserModel.updateUser(userId, email, name);

  if (!updatedUser) {
    logger.warn(`[UserService] User with ID ${userId} not found`);
    throw new AppError("User not found", HttpStatusCode.NOT_FOUND);
  }

  logger.info(`[UserService] Successfully updated user with ID: ${userId}`);
  return updatedUser;
};

export const addLikedDish = async (userId: string, dishId: string) => {
  logger.info(`[UserService] Adding liked dish ${dishId} for user ${userId}`);

  if (!userId || !dishId) {
    logger.warn("[UserService] Missing userId or dishId for liked dish");
    throw new AppError(
      "User ID and Dish ID are required",
      HttpStatusCode.BAD_REQUEST,
    );
  }

  const liked = await UserModel.addLikedDish(userId, dishId);

  if (!liked) {
    logger.warn(
      `[UserService] Dish ${dishId} already liked by user ${userId} or user not found`,
    );
    throw new AppError(
      "Dish already liked or user not found",
      HttpStatusCode.CONFLICT,
    );
  }

  logger.info(
    `[UserService] Successfully added liked dish ${dishId} for user ${userId}`,
  );
  return liked;
};

export const getLikedDishes = async (userId: string) => {
  logger.info(`[UserService] Getting liked dishes for user ${userId}`);

  if (!userId) {
    logger.warn("[UserService] Missing userId");
    throw new AppError("User ID is required", HttpStatusCode.BAD_REQUEST);
  }

  const likedDishes = await UserModel.getLikedDishes(userId);

  logger.info(
    `[UserService] Successfully retrieved ${likedDishes.length} liked dishes for user ${userId}`,
  );
  return likedDishes;
};
