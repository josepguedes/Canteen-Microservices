import pool from '../config/database.js';
import { Dish, CreateDishInput, UpdateDishInput } from '../models/dish.model.js';
import AppError from '../utils/AppError.js';
import * as HttpStatusCode from '../constants/httpStatusCode.js';
import logger from '../utils/logger.js';

class DishService {
  async getAllDishes(): Promise<Dish[]> {
    logger.info("Fetching all dishes");
    
    const result = await pool.query(
      'SELECT * FROM dishes ORDER BY dish_name'
    );
    
    logger.info({ count: result.rows.length }, "All dishes fetched successfully");
    return result.rows;
  }

  async getDishById(id: number): Promise<Dish> {
    logger.info({ id }, "Fetching dish by ID");
    
    const result = await pool.query(
      'SELECT * FROM dishes WHERE id_dish = $1',
      [id]
    );

    if (result.rows.length === 0) {
      logger.warn({ id }, "Dish not found");
      throw new AppError('Dish not found', HttpStatusCode.NOT_FOUND);
    }

    logger.info({ id }, "Dish fetched successfully");
    return result.rows[0];
  }

  async createDish(dishInput: CreateDishInput): Promise<Dish> {
    const { dish_name, dish_description } = dishInput;
    logger.info({ dish_name }, "Creating new dish");

    const result = await pool.query(
      `INSERT INTO dishes (dish_name, dish_description)
       VALUES ($1, $2)
       RETURNING *`,
      [dish_name, dish_description]
    );

    logger.info({ dishId: result.rows[0].id_dish }, "Dish created successfully");
    return result.rows[0];
  }

  async updateDish(id: number, dishInput: UpdateDishInput): Promise<Dish> {
    logger.info({ id, dishInput }, "Updating dish");
    
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (dishInput.dish_name !== undefined) {
      fields.push(`dish_name = $${paramCount++}`);
      values.push(dishInput.dish_name);
    }
    if (dishInput.dish_description !== undefined) {
      fields.push(`dish_description = $${paramCount++}`);
      values.push(dishInput.dish_description);
    }

    if (fields.length === 0) {
      logger.warn({ id }, "No fields to update");
      throw new AppError('No fields to update', HttpStatusCode.BAD_REQUEST);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE dishes SET ${fields.join(', ')} WHERE id_dish = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      logger.warn({ id }, "Dish not found");
      throw new AppError('Dish not found', HttpStatusCode.NOT_FOUND);
    }

    logger.info({ id }, "Dish updated successfully");
    return result.rows[0];
  }

  async deleteDish(id: number): Promise<void> {
    logger.info({ id }, "Deleting dish");
    
    const result = await pool.query(
      'DELETE FROM dishes WHERE id_dish = $1 RETURNING id_dish',
      [id]
    );

    if (result.rows.length === 0) {
      logger.warn({ id }, "Dish not found");
      throw new AppError('Dish not found', HttpStatusCode.NOT_FOUND);
    }

    logger.info({ id }, "Dish deleted successfully");
  }

  async getDishesByName(name: string): Promise<Dish[]> {
    logger.info({ name }, "Searching dishes by name");
    
    const result = await pool.query(
      'SELECT * FROM dishes WHERE dish_name ILIKE $1',
      [`%${name}%`]
    );

    logger.info({ name, count: result.rows.length }, "Dishes found");
    return result.rows;
  }
}

export default new DishService();