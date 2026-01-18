import { Pool } from "pg";
import logger from "../utils/logger";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const getAllUsers = async () => {
  logger.info("[UserModel] Fetching all users from database");
  
  const query = "SELECT id, email, name, created_at, updated_at FROM users ORDER BY created_at DESC";
  
  const result = await pool.query(query);
  
  logger.info(`[UserModel] Successfully fetched ${result.rows.length} users`);
  
  return result.rows;
};