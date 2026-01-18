import logger from "../utils/logger";
import pool from "../config/db";

export const getAllUsers = async () => {
  logger.info("[UserModel] Fetching all users from database");

  const query =
    "SELECT id, email, name, created_at, updated_at FROM users ORDER BY created_at DESC";

  const result = await pool.query(query);

  logger.info(`[UserModel] Successfully fetched ${result.rows.length} users`);

  return result.rows;
};

export const createUser = async (
  email: string,
  name: string,
  password: string,
) => {
  logger.info(`[UserModel] Creating user with email: ${email}`);

  const query =
    "INSERT INTO users (email, name, password, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, email, name, created_at, updated_at";

  const result = await pool.query(query, [email, name, password]);

  logger.info(
    `[UserModel] Successfully created user with ID: ${result.rows[0].id}`,
  );

  return result.rows[0];
};

export const deleteUser = async (userId: string) => {
  logger.info(`[UserModel] Deleting user with ID: ${userId}`);

  const query = "DELETE FROM users WHERE id = $1 RETURNING id, email, name";

  const result = await pool.query(query, [userId]);

  if (result.rowCount === 0) {
    logger.warn(`[UserModel] User with ID ${userId} not found`);
    return null;
  }

  logger.info(`[UserModel] Successfully deleted user with ID: ${userId}`);

  return result.rows[0];
};

export const getUserByEmail = async (email: string) => {
  logger.info(`[UserModel] Fetching user by email: ${email}`);

  const query = "SELECT id, email, name, password FROM users WHERE email = $1";

  const result = await pool.query(query, [email]);

  if (result.rows.length === 0) {
    logger.warn(`[UserModel] User with email ${email} not found`);
    return null;
  }

  logger.info(`[UserModel] Successfully found user with email: ${email}`);

  return result.rows[0];
};

export const updateUser = async (
  userId: string,
  email?: string,
  name?: string,
) => {
  logger.info(`[UserModel] Updating user with ID: ${userId}`);

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (email !== undefined) {
    updates.push(`email = $${paramCount}`);
    values.push(email);
    paramCount++;
  }

  if (name !== undefined) {
    updates.push(`name = $${paramCount}`);
    values.push(name);
    paramCount++;
  }

  if (updates.length === 0) {
    logger.warn(
      `[UserModel] No fields provided to update for user ID: ${userId}`,
    );
    return null;
  }

  updates.push(`updated_at = NOW()`);
  values.push(userId);

  const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING id, email, name, created_at, updated_at`;

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    logger.warn(`[UserModel] User with ID ${userId} not found`);
    return null;
  }

  logger.info(`[UserModel] Successfully updated user with ID: ${userId}`);

  return result.rows[0];
};

export const addLikedDish = async (userId: string, dishId: string) => {
  logger.info(`[UserModel] Adding liked dish ${dishId} for user ${userId}`);

  const query = `
    INSERT INTO user_liked_dishes (user_id, dish_id, created_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (user_id, dish_id) DO NOTHING
    RETURNING id, user_id, dish_id, created_at
  `;

  const result = await pool.query(query, [userId, dishId]);

  if (result.rowCount === 0) {
    logger.warn(
      `[UserModel] Dish ${dishId} already liked or user ${userId} missing`
    );
    return null;
  }

  logger.info(`[UserModel] Successfully added liked dish ${dishId} for user ${userId}`);

  return result.rows[0];
};
