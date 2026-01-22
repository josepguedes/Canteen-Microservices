import pool from "../config/database.js";
import { PeriodTime } from "../models/periodTime.model.js";
import AppError from "../utils/AppError.js";
import * as HttpStatusCode from "../constants/httpStatusCode.js";
import logger from "../utils/logger.js";

interface CreatePeriodTimeInput {
  menu_period: string;
  start_time: string;
  end_time: string;
}

interface UpdatePeriodTimeInput {
  menu_period?: string;
  start_time?: string;
  end_time?: string;
}

class PeriodTimeService {
  async getAllPeriods(): Promise<PeriodTime[]> {
    logger.info("Fetching all periods");
    const result = await pool.query(
      "SELECT * FROM period_time ORDER BY id"
    );
    logger.info({ count: result.rows.length }, "Periods fetched successfully");
    return result.rows;
  }

  async getPeriodById(id: number): Promise<PeriodTime> {
    logger.info({ id }, "Fetching period by ID");
    const result = await pool.query(
      "SELECT * FROM period_time WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      logger.warn({ id }, "Period not found");
      throw new AppError("Period not found", HttpStatusCode.NOT_FOUND);
    }

    logger.info({ id }, "Period fetched successfully");
    return result.rows[0];
  }

  async createPeriod(input: CreatePeriodTimeInput): Promise<PeriodTime> {
    logger.info({ input }, "Creating new period");
    const { menu_period, start_time, end_time } = input;

    try {
      const result = await pool.query(
        `INSERT INTO period_time (menu_period, start_time, end_time, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING *`,
        [menu_period, start_time, end_time]
      );

      logger.info({ id: result.rows[0].id }, "Period created successfully");
      return result.rows[0];
    } catch (error: any) {
      if (error.code === "23505") {
        throw new AppError(
          `Period '${menu_period}' already exists`,
          HttpStatusCode.CONFLICT
        );
      }
      throw error;
    }
  }

  async updatePeriod(id: number, input: UpdatePeriodTimeInput): Promise<PeriodTime> {
    logger.info({ id, input }, "Updating period");

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.menu_period !== undefined) {
      fields.push(`menu_period = $${paramCount++}`);
      values.push(input.menu_period);
    }

    if (input.start_time !== undefined) {
      fields.push(`start_time = $${paramCount++}`);
      values.push(input.start_time);
    }

    if (input.end_time !== undefined) {
      fields.push(`end_time = $${paramCount++}`);
      values.push(input.end_time);
    }

    if (fields.length === 0) {
      logger.warn({ id }, "No fields to update");
      throw new AppError("No fields to update", HttpStatusCode.BAD_REQUEST);
    }

    values.push(id);

    try {
      const result = await pool.query(
        `UPDATE period_time SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        logger.warn({ id }, "Period not found");
        throw new AppError("Period not found", HttpStatusCode.NOT_FOUND);
      }

      logger.info({ id }, "Period updated successfully");
      return result.rows[0];
    } catch (error: any) {
      if (error.code === "23505") {
        throw new AppError(
          "A period with this name already exists",
          HttpStatusCode.CONFLICT
        );
      }
      throw error;
    }
  }

  async deletePeriod(id: number): Promise<void> {
    logger.info({ id }, "Deleting period");

    const result = await pool.query(
      "DELETE FROM period_time WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      logger.warn({ id }, "Period not found");
      throw new AppError("Period not found", HttpStatusCode.NOT_FOUND);
    }

    logger.info({ id }, "Period deleted successfully");
  }
}

export default new PeriodTimeService();