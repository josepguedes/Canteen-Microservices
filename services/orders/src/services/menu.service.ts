import axios from 'axios';
import logger from '../utils/logger';
import AppError from '../utils/AppError';
import * as HttpStatusCode from '../constants/httpStatusCode';

interface MenuDetails {
  id_menu: number;
  dish_id: number;
  period_id: number;
  dish_category: string;
  menu_date: string;
  dish_name: string;
  dish_description?: string;
  menu_period?: string;
  start_time?: string;
  end_time?: string;
}

const MENU_SERVICE_URL = process.env.MENU_SERVICE_URL || 'http://canteen-menu-service:5002';

// Fetch menu details by ID
export const getMenuById = async (menuId: number): Promise<MenuDetails> => {
  try {
    logger.info(`Fetching menu details for menu_id: ${menuId} from ${MENU_SERVICE_URL}`);
    
    const query = `
      query GetMenus {
        menus {
          id_menu
          dish_id
          period_id
          dish_category
          menu_date
          dish_name
          dish_description
          menu_period
          start_time
          end_time
          created_at
        }
      }
    `;

    const response = await axios.post(MENU_SERVICE_URL, {
      query
    });

    if (response.data.errors) {
      logger.error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
      throw new Error(response.data.errors[0].message);
    }

    if (!response.data.data || !response.data.data.menus) {
      logger.error(`No menu data returned from GraphQL`);
      throw new AppError('Invalid response from menu service', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }

    const menu = response.data.data.menus.find((m: MenuDetails) => m.id_menu === menuId);
    
    if (!menu) {
      logger.warn(`Menu with ID ${menuId} not found in menu service`);
      throw new AppError('Menu not found', HttpStatusCode.NOT_FOUND);
    }

    logger.info(`Successfully fetched menu details for menu_id: ${menuId}`);
    return menu;
  } catch (error: any) {
    logger.error(`Error fetching menu details for menu_id ${menuId}: ${error.message}`);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to fetch menu details: ${error.message}`,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
};