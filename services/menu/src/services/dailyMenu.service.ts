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
  /**
   * @swagger
   * /menus/date/{date}:
   *   get:
   *     summary: Get menus by date
   *     description: Retrieve all menus for a specific date, optionally filtered by period
   *     tags: [Menus]
   *     parameters:
   *       - in: path
   *         name: date
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *         description: Menu date (YYYY-MM-DD)
   *       - in: query
   *         name: menuPeriod
   *         schema:
   *           type: string
   *           enum: [breakfast, lunch, dinner]
   *         description: Menu period (optional)
   *     responses:
   *       200:
   *         description: List of menus with dish details
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/MenuWithDish'
   */
  async getMenusByDate(
    date: string,
    menuPeriod?: string
  ): Promise<MenuWithDish[]> {
    logger.info({ date, menuPeriod }, "Fetching menus by date");
    
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
    logger.info({ count: result.rows.length }, "Menus fetched successfully");
    return result.rows;
  }

  /**
   * @swagger
   * /menus:
   *   get:
   *     summary: Get all menus
   *     description: Retrieve all menus ordered by date (descending) and dish category
   *     tags: [Menus]
   *     responses:
   *       200:
   *         description: List of all menus with dish details
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/MenuWithDish'
   */
  async getAllMenus(): Promise<MenuWithDish[]> {
    logger.info("Fetching all menus");
    
    const result = await pool.query(`
      SELECT m.*, d.dish_name, d.dish_description, d.dish_category
      FROM menus m
      JOIN dishes d ON m.dish_id = d.id_dish
      ORDER BY m.menu_date DESC, d.dish_category
    `);
    
    logger.info({ count: result.rows.length }, "All menus fetched successfully");
    return result.rows;
  }

  /**
   * @swagger
   * /menus/available:
   *   get:
   *     summary: Get available menus
   *     description: Retrieve all menus from today onwards
   *     tags: [Menus]
   *     responses:
   *       200:
   *         description: List of available menus with dish details
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/MenuWithDish'
   */
  async getAvailableMenus(): Promise<MenuWithDish[]> {
    const today = new Date().toISOString().split('T')[0];
    logger.info({ today }, "Fetching available menus");
    
    const result = await pool.query(
      `SELECT m.*, d.dish_name, d.dish_description, d.dish_category
       FROM menus m
       JOIN dishes d ON m.dish_id = d.id_dish
       WHERE m.menu_date >= $1
       ORDER BY m.menu_date ASC, d.dish_category`,
      [today]
    );
    
    logger.info({ count: result.rows.length }, "Available menus fetched successfully");
    return result.rows;
  }

  /**
   * @swagger
   * /menus/today:
   *   get:
   *     summary: Get today's menu
   *     description: Retrieve today's menu, optionally filtered by period
   *     tags: [Menus]
   *     parameters:
   *       - in: query
   *         name: menuPeriod
   *         schema:
   *           type: string
   *           enum: [breakfast, lunch, dinner]
   *         description: Menu period (optional)
   *     responses:
   *       200:
   *         description: Today's menu with dish details
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/MenuWithDish'
   */
  async getTodayMenu(menuPeriod?: string): Promise<MenuWithDish[]> {
    const today = new Date().toISOString().split('T')[0];
    logger.info({ today, menuPeriod }, "Fetching today's menu");
    return this.getMenusByDate(today, menuPeriod);
  }

  /**
   * @swagger
   * /menus:
   *   post:
   *     summary: Create a new menu
   *     description: Create a new menu entry for a specific dish, date, and period
   *     tags: [Menus]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateMenuInput'
   *     responses:
   *       201:
   *         description: Menu created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MenuWithDish'
   *       404:
   *         description: Dish not found
   *       409:
   *         description: Menu already exists for this dish, date and period
   */
  async createMenu(menuInput: CreateMenuInput): Promise<MenuWithDish> {
    const { dish_id, menu_date, menu_period } = menuInput;
    logger.info({ dish_id, menu_date, menu_period }, "Creating new menu");

    // Verificar se o prato existe
    const dishExists = await pool.query(
      "SELECT id_dish FROM dishes WHERE id_dish = $1",
      [dish_id]
    );

    if (dishExists.rows.length === 0) {
      logger.warn({ dish_id }, "Dish not found");
      throw new AppError("Dish not found", HttpStatusCode.NOT_FOUND);
    }

    // Verificar se já existe menu para este prato, data e período
    const existingMenu = await pool.query(
      `SELECT id_menu FROM menus 
       WHERE dish_id = $1 AND menu_date = $2 AND menu_period = $3`,
      [dish_id, menu_date, menu_period]
    );

    if (existingMenu.rows.length > 0) {
      logger.warn({ dish_id, menu_date, menu_period }, "Menu already exists");
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

    logger.info({ menuId: menu.id_menu }, "Menu created successfully");
    return dishResult.rows[0];
  }

  /**
   * @swagger
   * /menus/{id}:
   *   put:
   *     summary: Update a menu
   *     description: Update an existing menu entry
   *     tags: [Menus]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Menu ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateMenuInput'
   *     responses:
   *       200:
   *         description: Menu updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MenuWithDish'
   *       400:
   *         description: No fields to update
   *       404:
   *         description: Menu not found
   */
  async updateMenu(
    id: number,
    menuInput: UpdateMenuInput
  ): Promise<MenuWithDish> {
    logger.info({ id, menuInput }, "Updating menu");
    
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
      logger.warn({ id }, "No fields to update");
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
      logger.warn({ id }, "Menu not found");
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

    logger.info({ id }, "Menu updated successfully");
    return dishResult.rows[0];
  }

  /**
   * @swagger
   * /menus/{id}:
   *   delete:
   *     summary: Delete a menu
   *     description: Delete a menu entry by ID
   *     tags: [Menus]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Menu ID
   *     responses:
   *       204:
   *         description: Menu deleted successfully
   *       404:
   *         description: Menu not found
   */
  async deleteMenu(id: number): Promise<void> {
    logger.info({ id }, "Deleting menu");
    
    const result = await pool.query(
      "DELETE FROM menus WHERE id_menu = $1 RETURNING id_menu",
      [id]
    );

    if (result.rows.length === 0) {
      logger.warn({ id }, "Menu not found");
      throw new AppError("Menu not found", HttpStatusCode.NOT_FOUND);
    }

    logger.info({ id }, "Menu deleted successfully");
  }
}

export default new MenuService();
