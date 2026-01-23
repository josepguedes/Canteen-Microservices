import dishService from "../services/dish.service.js";
import menuService from "../services/dailyMenu.service.js";
import periodTimeService from "../services/periodTime.service.js";
import logger from "../utils/logger.js";

// Helper function to format dates
const formatDate = (date: Date | string): string => {
  if (!date) return "";
  return new Date(date).toISOString();
};

// Helper to format dish with proper dates
const formatDish = (dish: any) => ({
  ...dish,
  created_at: formatDate(dish.created_at),
});

// Helper to format menu with proper dates
const formatMenu = (menu: any) => ({
  ...menu,
  created_at: formatDate(menu.created_at),
});

// Helper to format period with proper dates
const formatPeriod = (period: any) => ({
  ...period,
  created_at: formatDate(period.created_at),
});

export const resolvers = {
  Query: {
    // Dishes
    dishes: async () => {
      logger.info("GraphQL: Fetching all dishes");
      try {
        const dishes = await dishService.getAllDishes();
        logger.info(
          { count: dishes.length },
          "GraphQL: Dishes fetched successfully",
        );
        return dishes.map(formatDish);
      } catch (error) {
        logger.error({ error }, "GraphQL: Error fetching dishes");
        throw error;
      }
    },

    dishById: async (_: any, { id }: { id: number }) => {
      logger.info({ id }, "GraphQL: Fetching dish by ID");
      try {
        const dish = await dishService.getDishById(id);
        logger.info({ id }, "GraphQL: Dish fetched successfully");
        return formatDish(dish);
      } catch (error) {
        logger.error({ id, error }, "GraphQL: Error fetching dish");
        throw error;
      }
    },

    dishByName: async (_: any, { name }: { name: string }) => {
      logger.info({ name }, "GraphQL: Searching dishes by name");
      try {
        const dishes = await dishService.getDishesByName(name);
        logger.info({ name, count: dishes.length }, "GraphQL: Dishes found");
        return dishes.map(formatDish);
      } catch (error) {
        logger.error({ name, error }, "GraphQL: Error searching dishes");
        throw error;
      }
    },

    // Periods
    periods: async () => {
      logger.info("GraphQL: Fetching all periods");
      try {
        const periods = await periodTimeService.getAllPeriods();
        logger.info(
          { count: periods.length },
          "GraphQL: Periods fetched successfully",
        );
        return periods.map(formatPeriod);
      } catch (error) {
        logger.error({ error }, "GraphQL: Error fetching periods");
        throw error;
      }
    },

    periodById: async (_: any, { id }: { id: number }) => {
      logger.info({ id }, "GraphQL: Fetching period by ID");
      try {
        const period = await periodTimeService.getPeriodById(id);
        logger.info({ id }, "GraphQL: Period fetched successfully");
        return formatPeriod(period);
      } catch (error: any) {
        if (error.statusCode === 404) {
          logger.warn({ id }, "GraphQL: Period not found, returning null");
          return null;
        }
        logger.error({ id, error }, "GraphQL: Error fetching period");
        throw error;
      }
    },

    // Menus
    allMenus: async () => {
      logger.info("GraphQL: Fetching all menus");
      try {
        const menus = await menuService.getAllMenus();
        logger.info(
          { count: menus.length },
          "GraphQL: All menus fetched successfully",
        );
        return menus.map(formatMenu);
      } catch (error) {
        logger.error({ error }, "GraphQL: Error fetching all menus");
        throw error;
      }
    },

    menuById: async (_: any, { id }: { id: number }) => {
      logger.info({ id }, "GraphQL: Fetching menu by ID");
      try {
        const menu = await menuService.getMenuById(id);
        logger.info({ id }, "GraphQL: Menu fetched successfully");
        return formatMenu(menu);
      } catch (error: any) {
        if (error.statusCode === 404) {
          logger.warn({ id }, "GraphQL: Menu not found, returning null");
          return null;
        }
        logger.error({ id, error }, "GraphQL: Error fetching menu");
        throw error;
      }
    },

    menusByDate: async (
      _: any,
      { date, menuPeriod }: { date: string; menuPeriod?: string },
    ) => {
      logger.info({ date, menuPeriod }, "GraphQL: Fetching menus by date");
      try {
        const menus = await menuService.getMenusByDate(date, menuPeriod);
        logger.info(
          { date, count: menus.length },
          "GraphQL: Menus fetched successfully",
        );
        return menus.map(formatMenu);
      } catch (error) {
        logger.error(
          { date, menuPeriod, error },
          "GraphQL: Error fetching menus",
        );
        throw error;
      }
    },

    todayMenu: async (_: any, { menuPeriod }: { menuPeriod?: string }) => {
      logger.info({ menuPeriod }, "GraphQL: Fetching today's menu");
      try {
        const today = new Date().toISOString().split("T")[0];
        const menus = await menuService.getMenusByDate(today, menuPeriod);
        logger.info(
          { menuPeriod, count: menus.length },
          "GraphQL: Today's menu fetched",
        );
        return menus.map(formatMenu);
      } catch (error) {
        logger.error(
          { menuPeriod, error },
          "GraphQL: Error fetching today's menu",
        );
        throw error;
      }
    },
  },

  Mutation: {
    // Dishes
    createDish: async (_: any, { input }: { input: any }) => {
      logger.info({ input }, "GraphQL: Creating dish");
      try {
        const dish = await dishService.createDish(input);
        logger.info({ id: dish.id_dish }, "GraphQL: Dish created successfully");
        return formatDish(dish);
      } catch (error) {
        logger.error({ input, error }, "GraphQL: Error creating dish");
        throw error;
      }
    },

    updateDish: async (_: any, { id, input }: { id: number; input: any }) => {
      logger.info({ id, input }, "GraphQL: Updating dish");
      try {
        const dish = await dishService.updateDish(id, input);
        logger.info({ id }, "GraphQL: Dish updated successfully");
        return formatDish(dish);
      } catch (error) {
        logger.error({ id, input, error }, "GraphQL: Error updating dish");
        throw error;
      }
    },

    deleteDish: async (_: any, { id }: { id: number }) => {
      logger.info({ id }, "GraphQL: Deleting dish");
      try {
        await dishService.deleteDish(id);
        logger.info({ id }, "GraphQL: Dish deleted successfully");
        return true;
      } catch (error) {
        logger.error({ id, error }, "GraphQL: Error deleting dish");
        throw error;
      }
    },

    // Periods
    createPeriod: async (_: any, { input }: { input: any }) => {
      logger.info({ input }, "GraphQL: Creating period");
      try {
        const period = await periodTimeService.createPeriod(input);
        logger.info({ id: period.id }, "GraphQL: Period created successfully");
        return formatPeriod(period);
      } catch (error) {
        logger.error({ input, error }, "GraphQL: Error creating period");
        throw error;
      }
    },

    updatePeriod: async (_: any, { id, input }: { id: number; input: any }) => {
      logger.info({ id, input }, "GraphQL: Updating period");
      try {
        const period = await periodTimeService.updatePeriod(id, input);
        logger.info({ id }, "GraphQL: Period updated successfully");
        return formatPeriod(period);
      } catch (error) {
        logger.error({ id, input, error }, "GraphQL: Error updating period");
        throw error;
      }
    },

    deletePeriod: async (_: any, { id }: { id: number }) => {
      logger.info({ id }, "GraphQL: Deleting period");
      try {
        await periodTimeService.deletePeriod(id);
        logger.info({ id }, "GraphQL: Period deleted successfully");
        return true;
      } catch (error) {
        logger.error({ id, error }, "GraphQL: Error deleting period");
        throw error;
      }
    },

    // Menus
    createMenu: async (_: any, { input }: { input: any }) => {
      logger.info({ input }, "GraphQL: Creating menu");
      try {
        const menu = await menuService.createMenu(input);
        logger.info({ id: menu.id_menu }, "GraphQL: Menu created successfully");
        return formatMenu(menu);
      } catch (error) {
        logger.error({ input, error }, "GraphQL: Error creating menu");
        throw error;
      }
    },

    updateMenu: async (_: any, { id, input }: { id: number; input: any }) => {
      logger.info({ id, input }, "GraphQL: Updating menu");
      try {
        const menu = await menuService.updateMenu(id, input);
        logger.info({ id }, "GraphQL: Menu updated successfully");
        return formatMenu(menu);
      } catch (error) {
        logger.error({ id, input, error }, "GraphQL: Error updating menu");
        throw error;
      }
    },

    deleteMenu: async (_: any, { id }: { id: number }) => {
      logger.info({ id }, "GraphQL: Deleting menu");
      try {
        await menuService.deleteMenu(id);
        logger.info({ id }, "GraphQL: Menu deleted successfully");
        return true;
      } catch (error) {
        logger.error({ id, error }, "GraphQL: Error deleting menu");
        throw error;
      }
    },
  },
};