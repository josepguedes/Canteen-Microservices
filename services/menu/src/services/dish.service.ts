import pool from '../config/database.js';
import { Dish, CreateDishInput, UpdateDishInput } from '../models/dish.model.js';
import AppError from '../utils/AppError.js';
import * as HttpStatusCode from '../constants/httpStatusCode.js';

class DishService {
  async getAllDishes(): Promise<Dish[]> {
    const result = await pool.query(
      'SELECT * FROM dishes ORDER BY dish_category, dish_name'
    );
    return result.rows;
  }

  async getDishById(id: number): Promise<Dish> {
    const result = await pool.query(
      'SELECT * FROM dishes WHERE id_dish = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Dish not found', HttpStatusCode.NOT_FOUND);
    }

    return result.rows[0];
  }

  async createDish(dishInput: CreateDishInput): Promise<Dish> {
    const { dish_name, dish_description, dish_category } = dishInput;

    const result = await pool.query(
      `INSERT INTO dishes (dish_name, dish_description, dish_category)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [dish_name, dish_description, dish_category]
    );

    return result.rows[0];
  }

  async updateDish(id: number, dishInput: UpdateDishInput): Promise<Dish> {
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
    if (dishInput.dish_category !== undefined) {
      fields.push(`dish_category = $${paramCount++}`);
      values.push(dishInput.dish_category);
    }

    if (fields.length === 0) {
      throw new AppError('No fields to update', HttpStatusCode.BAD_REQUEST);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE dishes SET ${fields.join(', ')} WHERE id_dish = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new AppError('Dish not found', HttpStatusCode.NOT_FOUND);
    }

    return result.rows[0];
  }

  async deleteDish(id: number): Promise<void> {
    const result = await pool.query(
      'DELETE FROM dishes WHERE id_dish = $1 RETURNING id_dish',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Dish not found', HttpStatusCode.NOT_FOUND);
    }
  }

  async getDishesByCategory(category: string): Promise<Dish[]> {
    const result = await pool.query(
      'SELECT * FROM dishes WHERE dish_category = $1 ORDER BY dish_name',
      [category]
    );
    return result.rows;
  }

  async getDishesByName(name: string): Promise<Dish[]> {
    const result = await pool.query(
      'SELECT * FROM dishes WHERE dish_name ILIKE $1 ORDER BY dish_name',
      [`%${name}%`]
    );
    return result.rows;
  }
}

export default new DishService();