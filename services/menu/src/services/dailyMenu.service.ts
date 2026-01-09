import pool from "../config/database.js";
import {
  Menu,
  MenuWithDish,
  CreateMenuInput,
  UpdateMenuInput,
} from "../models/dailyMenu.model.js";
import AppError from "../utils/AppError.js";
import * as HttpStatusCode from "../constants/httpStatusCode.js";

class MenuService {
  async getMenusByDate(
    date: string,
    menuPeriod?: string
  ): Promise<MenuWithDish[]> {
    let query = `
      SELECT m.*, d.dish_name, d.dish_description, d.dish_category
      FROM menus m
      JOIN dishes d ON m.dish_id = d.id_dish
      WHERE m.menu_date = $1
    `;
    const params: any[] = [date];

    if (menuPeriod) {
      query += ` AND m.menu_period = $2`;
      params.push(menuPeriod);
    }

    query += ` ORDER BY d.dish_category`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getAllMenus(): Promise<MenuWithDish[]> {
    const result = await pool.query(`
    SELECT m.*, d.dish_name, d.dish_description, d.dish_category
    FROM menus m
    JOIN dishes d ON m.dish_id = d.id_dish
    ORDER BY m.menu_date DESC, d.dish_category
  `);
    return result.rows;
  }

  async getAvailableMenus(): Promise<MenuWithDish[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await pool.query(
      `SELECT m.*, d.dish_name, d.dish_description, d.dish_category
       FROM menus m
       JOIN dishes d ON m.dish_id = d.id_dish
       WHERE m.menu_date >= $1
       ORDER BY m.menu_date ASC, d.dish_category`,
      [today]
    );
    
    return result.rows;
  }

  async getTodayMenu(menuPeriod?: string): Promise<MenuWithDish[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getMenusByDate(today, menuPeriod);
  }

  async createMenu(menuInput: CreateMenuInput): Promise<MenuWithDish> {
    const { dish_id, menu_date, menu_period } = menuInput;

    // Verificar se o prato existe
    const dishExists = await pool.query(
      "SELECT id_dish FROM dishes WHERE id_dish = $1",
      [dish_id]
    );

    if (dishExists.rows.length === 0) {
      throw new AppError("Dish not found", HttpStatusCode.NOT_FOUND);
    }

    // Verificar se já existe menu para este prato, data e período
    const existingMenu = await pool.query(
      `SELECT id_menu FROM menus 
       WHERE dish_id = $1 AND menu_date = $2 AND menu_period = $3`,
      [dish_id, menu_date, menu_period]
    );

    if (existingMenu.rows.length > 0) {
      throw new AppError(
        "Menu already exists for this dish, date and period", 
        HttpStatusCode.CONFLICT
      );
    }

    const result = await pool.query(
      `INSERT INTO menus (dish_id, menu_date, menu_period)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [dish_id, menu_date, menu_period]
    );

    const menu = result.rows[0];

    // Get dish details
    const dishResult = await pool.query(
      `SELECT m.*, d.dish_name, d.dish_description, d.dish_category
       FROM menus m
       JOIN dishes d ON m.dish_id = d.id_dish
       WHERE m.id_menu = $1`,
      [menu.id_menu]
    );

    return dishResult.rows[0];
  }

  async updateMenu(
    id: number,
    menuInput: UpdateMenuInput
  ): Promise<MenuWithDish> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (menuInput.dish_id !== undefined) {
      fields.push(`dish_id = $${paramCount++}`);
      values.push(menuInput.dish_id);
    }
    if (menuInput.menu_date !== undefined) {
      fields.push(`menu_date = $${paramCount++}`);
      values.push(menuInput.menu_date);
    }
    if (menuInput.menu_period !== undefined) {
      fields.push(`menu_period = $${paramCount++}`);
      values.push(menuInput.menu_period);
    }

    if (fields.length === 0) {
      throw new AppError("No fields to update", HttpStatusCode.BAD_REQUEST);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE menus SET ${fields.join(
        ", "
      )} WHERE id_menu = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new AppError("Menu not found", HttpStatusCode.NOT_FOUND);
    }

    // Get dish details
    const dishResult = await pool.query(
      `SELECT m.*, d.dish_name, d.dish_description, d.dish_category
       FROM menus m
       JOIN dishes d ON m.dish_id = d.id_dish
       WHERE m.id_menu = $1`,
      [id]
    );

    return dishResult.rows[0];
  }

  async deleteMenu(id: number): Promise<void> {
    const result = await pool.query(
      "DELETE FROM menus WHERE id_menu = $1 RETURNING id_menu",
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError("Menu not found", HttpStatusCode.NOT_FOUND);
    }
  }
}

export default new MenuService();
