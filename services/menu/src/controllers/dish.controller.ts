import { Request, Response } from 'express';
import dishService from '../services/dish.service.js';
import AppError from '../utils/AppError.js';
import * as HttpStatusCode from '../constants/httpStatusCode.js';

class DishController {
  // GET /menu/dishes - Get all dishes
  async getAllDishes(req: Request, res: Response) {
    try {
      const dishes = await dishService.getAllDishes();
      res.status(200).json({
        success: true,
        data: dishes,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }

  // GET /menu/dishes/:id - Get dish by ID
  async getDishById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const dish = await dishService.getDishById(id);
      res.status(200).json({
        success: true,
        data: dish,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }

  // GET /menu/dishes/category/:category - Get dishes by category
  async getDishesByCategory(req: Request, res: Response) {
    try {
      const category = req.params.category;
      const dishes = await dishService.getDishesByCategory(category);
      res.status(200).json({
        success: true,
        data: dishes,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }

  // POST /menu/dishes - Create a new dish
  async createDish(req: Request, res: Response) {
    try {
      const dish = await dishService.createDish(req.body);
      res.status(201).json({
        success: true,
        data: dish,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }

  // PUT /menu/dishes/:id - Update a dish
  async updateDish(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const dish = await dishService.updateDish(id, req.body);
      res.status(200).json({
        success: true,
        data: dish,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }

  // DELETE /menu/dishes/:id - Delete a dish
  async deleteDish(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await dishService.deleteDish(id);
      res.status(200).json({
        success: true,
        message: 'Dish deleted successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }
}

export default new DishController();
