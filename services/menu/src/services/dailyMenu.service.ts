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

class MenuService {
  async getMenusByDate(
    date: string,
    menuPeriod?: string,
  ): Promise<MenuWithDish[]> {
    logger.info({ date, menuPeriod }, "Fetching menus by date");

    let query = `
      SELECT m.*, d.dish_name, d.dish_description
      FROM menus m
      JOIN dishes d ON m.dish_id = d.id_dish
      WHERE m.menu_date = $1
    `;
    const params: any[] = [date];

    if (menuPeriod) {
      query += ` AND m.menu_period = $2`;
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
      SELECT m.*, d.dish_name, d.dish_description
      FROM menus m
      JOIN dishes d ON m.dish_id = d.id_dish
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
      `SELECT m.*, d.dish_name, d.dish_description
       FROM menus m
       JOIN dishes d ON m.dish_id = d.id_dish
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

    const { dish_id, dish_category, menu_date, menu_period } = input;

    // Validate that the dish exists
    const dishResult = await pool.query(
      "SELECT * FROM dishes WHERE id_dish = $1",
      [dish_id],
    );

    if (dishResult.rows.length === 0) {
      throw new AppError(
        `Dish with ID ${dish_id} not found`,
        HttpStatusCode.NOT_FOUND,
      );
    }

    try {
      const result = await pool.query(
        `INSERT INTO menus (dish_id, dish_category, menu_date, menu_period, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [dish_id, dish_category, menu_date, menu_period],
      );

      logger.info({ id: result.rows[0].id_menu }, "Menu created successfully");
      return result.rows[0];
    } catch (error: any) {
      if (error.code === "23505") {
        // Unique violation
        throw new AppError(
          `A menu for ${dish_category} already exists for ${menu_period} on ${menu_date}`,
          HttpStatusCode.CONFLICT,
        );
      }
      throw error;
    }
  }

  async updateMenu(id: number, input: UpdateMenuInput): Promise<Menu> {
    logger.info({ id, input }, "Updating menu");

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.dish_id !== undefined) {
      // Validate that the dish exists
      const dishResult = await pool.query(
        "SELECT * FROM dishes WHERE id_dish = $1",
        [input.dish_id],
      );

      if (dishResult.rows.length === 0) {
        throw new AppError(
          `Dish with ID ${input.dish_id} not found`,
          HttpStatusCode.NOT_FOUND,
        );
      }

      fields.push(`dish_id = $${paramCount++}`);
      values.push(input.dish_id);
    }

    if (input.dish_category !== undefined) {
      fields.push(`dish_category = $${paramCount++}`);
      values.push(input.dish_category);
    }

    if (input.menu_date !== undefined) {
      fields.push(`menu_date = $${paramCount++}`);
      values.push(input.menu_date);
    }

    if (input.menu_period !== undefined) {
      fields.push(`menu_period = $${paramCount++}`);
      values.push(input.menu_period);
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
      if (error.code === "23505") {
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
}

export default new MenuService();