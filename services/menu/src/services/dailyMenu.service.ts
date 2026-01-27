import pool from "../config/database.js";
import {
  Menu,
  MenuWithDish,
  CreateMenuInput,
  UpdateMenuInput,
} from "../models/dailyMenu.model.js";
import AppError from "../utils/AppError.js";
import * as HttpStatusCode from "../constants/httpStatusCode.js";
import logger from "../utils/logger.js";

const PostgresErrorCode = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  CHECK_VIOLATION: '23514',
} as const;

class MenuService {
  // Private helper methods for validation
  private validateDateFormat(date: string): void {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new AppError(
        "Invalid date format. Use YYYY-MM-DD",
        HttpStatusCode.BAD_REQUEST,
      );
    }
  }

  private async validateDishExists(dish_id: number): Promise<void> {
    const result = await pool.query(
      "SELECT 1 FROM dishes WHERE id_dish = $1",
      [dish_id],
    );

    if (result.rows.length === 0) {
      throw new AppError(
        `Dish with ID ${dish_id} not found`,
        HttpStatusCode.NOT_FOUND,
      );
    }
  }

  private async validatePeriodExists(period_id: number): Promise<void> {
    const result = await pool.query(
      "SELECT 1 FROM period_time WHERE id = $1",
      [period_id],
    );

    if (result.rows.length === 0) {
      throw new AppError(
        `Period with ID ${period_id} not found`,
        HttpStatusCode.NOT_FOUND,
      );
    }
  }
  async getMenusByDate(
    date: string,
    menuPeriod?: string,
  ): Promise<MenuWithDish[]> {
    logger.info({ date, menuPeriod }, "Fetching menus by date");

    let query = `
      SELECT m.*, d.dish_name, d.dish_description, 
             pt.menu_period, pt.start_time, pt.end_time
      FROM menus m
      JOIN dishes d ON m.dish_id = d.id_dish
      JOIN period_time pt ON m.period_id = pt.id
      WHERE m.menu_date = $1
    `;
    const params: any[] = [date];

    if (menuPeriod) {
      query += ` AND pt.menu_period = $2`;
      params.push(menuPeriod);
    }

    query += ` ORDER BY m.dish_category`;

    const result = await pool.query(query, params);
    logger.info({ count: result.rows.length }, "Menus fetched successfully");
    return result.rows;
  }

  async getAllMenus(): Promise<MenuWithDish[]> {
    logger.info("Fetching all menus");

    const result = await pool.query(`
      SELECT m.*, d.dish_name, d.dish_description,
             pt.menu_period, pt.start_time, pt.end_time
      FROM menus m
      JOIN dishes d ON m.dish_id = d.id_dish
      JOIN period_time pt ON m.period_id = pt.id
      ORDER BY m.menu_date DESC, m.dish_category
    `);

    logger.info(
      { count: result.rows.length },
      "All menus fetched successfully",
    );
    return result.rows;
  }

  async getMenuById(id: number): Promise<MenuWithDish> {
    logger.info({ id }, "Fetching menu by ID");

    const result = await pool.query(
      `SELECT m.*, d.dish_name, d.dish_description,
              pt.menu_period, pt.start_time, pt.end_time
       FROM menus m
       JOIN dishes d ON m.dish_id = d.id_dish
       JOIN period_time pt ON m.period_id = pt.id
       WHERE m.id_menu = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      logger.warn({ id }, "Menu not found");
      throw new AppError("Menu not found", HttpStatusCode.NOT_FOUND);
    }

    logger.info({ id }, "Menu fetched successfully");
    return result.rows[0];
  }

  async getTodayMenus(menuPeriod?: string): Promise<MenuWithDish[]> {
    const today = new Date().toISOString().split("T")[0];
    logger.info({ today, menuPeriod }, "Fetching today's menus");
    return this.getMenusByDate(today, menuPeriod);
  }

  async createMenu(input: CreateMenuInput): Promise<Menu> {
    logger.info({ input }, "Creating new menu");

    const { dish_id, dish_category, menu_date, period_id } = input;

    // Validate inputs
    this.validateDateFormat(menu_date);
    await this.validateDishExists(dish_id);
    await this.validatePeriodExists(period_id);

    try {
      const result = await pool.query(
        `INSERT INTO menus (dish_id, period_id, dish_category, menu_date, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
        [dish_id, period_id, dish_category, menu_date],
      );

      logger.info({ id: result.rows[0].id_menu }, "Menu created successfully");
      return result.rows[0];
    } catch (error: any) {
      if (error.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        throw new AppError(
          `A menu for ${dish_category} already exists for this period on ${menu_date}`,
          HttpStatusCode.CONFLICT,
        );
      }
      throw error;
    }
  }

  async updateMenu(id: number, input: UpdateMenuInput): Promise<Menu> {
    logger.info({ id, input }, "Updating menu");

    // Validate inputs if provided
    if (input.dish_id !== undefined) {
      await this.validateDishExists(input.dish_id);
    }
    if (input.period_id !== undefined) {
      await this.validatePeriodExists(input.period_id);
    }
    if (input.menu_date !== undefined) {
      this.validateDateFormat(input.menu_date);
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.dish_id !== undefined) {
      fields.push(`dish_id = $${paramCount++}`);
      values.push(input.dish_id);
    }

    if (input.period_id !== undefined) {
      fields.push(`period_id = $${paramCount++}`);
      values.push(input.period_id);
    }

    if (input.dish_category !== undefined) {
      fields.push(`dish_category = $${paramCount++}`);
      values.push(input.dish_category);
    }

    if (input.menu_date !== undefined) {
      fields.push(`menu_date = $${paramCount++}`);
      values.push(input.menu_date);
    }

    if (fields.length === 0) {
      logger.warn({ id }, "No fields to update");
      throw new AppError("No fields to update", HttpStatusCode.BAD_REQUEST);
    }

    values.push(id);

    try {
      const result = await pool.query(
        `UPDATE menus SET ${fields.join(", ")} WHERE id_menu = $${paramCount} RETURNING *`,
        values,
      );

      if (result.rows.length === 0) {
        logger.warn({ id }, "Menu not found");
        throw new AppError("Menu not found", HttpStatusCode.NOT_FOUND);
      }

      logger.info({ id }, "Menu updated successfully");
      return result.rows[0];
    } catch (error: any) {
      if (error.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        throw new AppError(
          "A menu with this combination already exists",
          HttpStatusCode.CONFLICT,
        );
      }
      throw error;
    }
  }

  async deleteMenu(id: number): Promise<void> {
    logger.info({ id }, "Deleting menu");

    const result = await pool.query(
      "DELETE FROM menus WHERE id_menu = $1 RETURNING id_menu",
      [id],
    );

    if (result.rows.length === 0) {
      logger.warn({ id }, "Menu not found");
      throw new AppError("Menu not found", HttpStatusCode.NOT_FOUND);
    }

    logger.info({ id }, "Menu deleted successfully");
  }

  // NOVA função para buscar períodos disponíveis
  async getPeriods() {
    logger.info("Fetching all periods");
    const result = await pool.query("SELECT * FROM period_time ORDER BY id");
    return result.rows;
  }
}

export default new MenuService();
