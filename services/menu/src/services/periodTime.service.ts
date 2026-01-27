import pool from "../config/database.js";
import { PeriodTime } from "../models/periodTime.model.js";
import AppError from "../utils/AppError.js";
import * as HttpStatusCode from "../constants/httpStatusCode.js";
import logger from "../utils/logger.js";

const PostgresErrorCode = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  CHECK_VIOLATION: '23514',
} as const;

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
  // Helper function to convert time string to minutes
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper function to validate time order
  private validateTimeOrder(start_time: string, end_time: string): void {
    const startMinutes = this.timeToMinutes(start_time);
    const endMinutes = this.timeToMinutes(end_time);
    
    if (startMinutes >= endMinutes) {
      throw new AppError(
        "Start time must be before end time",
        HttpStatusCode.BAD_REQUEST
      );
    }
  }

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

    // Validate that start_time is before end_time
    this.validateTimeOrder(start_time, end_time);

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
      if (error.code === PostgresErrorCode.UNIQUE_VIOLATION) {
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

    // First, get the current period to merge with updates
    const currentPeriod = await this.getPeriodById(id);

    const updatedStartTime = input.start_time ?? currentPeriod.start_time;
    const updatedEndTime = input.end_time ?? currentPeriod.end_time;

    // Validate time order with merged values
    this.validateTimeOrder(updatedStartTime, updatedEndTime);

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
      if (error.code === PostgresErrorCode.UNIQUE_VIOLATION) {
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