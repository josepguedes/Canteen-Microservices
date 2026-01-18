import * as UserModel from "../models/user.model";
import logger from "../utils/logger";
import AppError from "../utils/AppError";
import * as HttpStatusCode from "../constants/httpStatusCode";

export const getAllUsers = async () => {
  logger.info("[UserService] Getting all users");

  try {
    const users = await UserModel.getAllUsers();

    if (!users || users.length === 0) {
      logger.info("[UserService] No users found in database");
      return [];
    }

    logger.info(`[UserService] Successfully retrieved ${users.length} users`);
    return users;
  } catch (error) {
    logger.error("[UserService] Error getting all users:", error);
    throw error;
  }
};
