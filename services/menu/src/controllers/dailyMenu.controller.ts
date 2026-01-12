import { Request, Response } from 'express';
import menuService from '../services/dailyMenu.service.js';
import AppError from '../utils/AppError.js';
import * as HttpStatusCode from '../constants/httpStatusCode.js';
import logger from '../utils/logger.js';

class MenuController {
  // GET /menu/daily?date=2026-01-05&mealType=lunch
  async getMenuByDate(req: Request, res: Response) {
    try {
      const date = req.query.date as string;
      const mealType = req.query.mealType as string | undefined;

      // Se não houver date, retornar todos os menus
      if (!date) {
        logger.info("Controller: Fetching all menus");
        const allMenus = await menuService.getAllMenus();
        return res.status(200).json({
          success: true,
          data: allMenus,
        });
      }

      logger.info({ date, mealType }, "Controller: Fetching menu by date");
      const menu = await menuService.getMenusByDate(date, mealType);
      res.status(200).json({
        success: true,
        data: menu,
      });
    } catch (error) {
      logger.error({ error }, "Controller: Error in getMenuByDate");
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

  // GET /menu/daily/available?date=2026-01-05&mealType=lunch
  async getAvailableMenu(req: Request, res: Response) {
    try {
      const date = req.query.date as string;
      const mealType = req.query.mealType as string | undefined;

      if (!date) {
        logger.warn("Controller: Date parameter missing");
        return res.status(400).json({
          success: false,
          message: 'Date parameter is required',
        });
      }

      logger.info({ date, mealType }, "Controller: Fetching available menu");
      const menu = await menuService.getMenusByDate(date, mealType);
      res.status(200).json({
        success: true,
        data: menu,
      });
    } catch (error) {
      logger.error({ error }, "Controller: Error in getAvailableMenu");
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

  // GET /menu/daily/today?mealType=lunch
  async getTodayMenu(req: Request, res: Response) {
    try {
      const mealType = req.query.mealType as string | undefined;
      const today = new Date().toISOString().split('T')[0];
      logger.info({ today, mealType }, "Controller: Fetching today's menu");
      const menu = await menuService.getMenusByDate(today, mealType);
      res.status(200).json({
        success: true,
        data: menu,
      });
    } catch (error) {
      logger.error({ error }, "Controller: Error in getTodayMenu");
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

  // POST /menu/daily - Create menu item
  async createMenu(req: Request, res: Response) {
    try {
      logger.info({ body: req.body }, "Controller: Creating menu");
      const menuItem = await menuService.createMenu(req.body);
      res.status(201).json({
        success: true,
        data: menuItem,
      });
    } catch (error) {
      logger.error({ error }, "Controller: Error in createMenu");
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

  // PUT /menu/daily/:id - Update menu item
  async updateMenu(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      logger.info({ id, body: req.body }, "Controller: Updating menu");
      const menuItem = await menuService.updateMenu(id, req.body);
      res.status(200).json({
        success: true,
        data: menuItem,
      });
    } catch (error) {
      logger.error({ error }, "Controller: Error in updateMenu");
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

  // DELETE /menu/daily/:id - Delete menu item
  async deleteMenu(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      logger.info({ id }, "Controller: Deleting menu");
      await menuService.deleteMenu(id);
      res.status(200).json({
        success: true,
        message: 'Menu item deleted successfully',
      });
    } catch (error) {
      logger.error({ error }, "Controller: Error in deleteMenu");
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

export default new MenuController();
