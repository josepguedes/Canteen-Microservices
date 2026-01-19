import { Pool } from "pg";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("error", (err) => {
  logger.error(err, "[DB] Unexpected error on idle client");
});

logger.info("[DB] PostgreSQL pool initialized");

export default pool;
