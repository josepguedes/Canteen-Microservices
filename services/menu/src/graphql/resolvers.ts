import dishService from '../services/dish.service.js';
import menuService from '../services/dailyMenu.service.js';

// Helper function to format dates
const formatDate = (date: Date | string): string => {
  if (!date) return '';
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

export const resolvers = {
  Query: {
    // Dishes
    dishes: async () => {
      const dishes = await dishService.getAllDishes();
      return dishes.map(formatDish);
    },

    dishById: async (_: any, { id }: { id: number }) => {
      const dish = await dishService.getDishById(id);
      return formatDish(dish);
    },

    dishByName: async (_: any, { name }: { name: string }) => {
      const dishes = await dishService.getDishesByName(name);
      return dishes.map(formatDish);
    },

    dishesByCategory: async (_: any, { category }: { category: string }) => {
      const dishes = await dishService.getDishesByCategory(category);
      return dishes.map(formatDish);
    },

    // Menus
    menusByDate: async (_: any, { date, menuPeriod }: { date: string; menuPeriod?: string }) => {
      const menus = await menuService.getMenusByDate(date, menuPeriod);
      return menus.map(formatMenu);
    },

    todayMenu: async (_: any, { menuPeriod }: { menuPeriod?: string }) => {
      const today = new Date().toISOString().split('T')[0];
      const menus = await menuService.getMenusByDate(today, menuPeriod);
      return menus.map(formatMenu);
    },
  },

  Mutation: {
    // Dishes
    createDish: async (_: any, { input }: { input: any }) => {
      const dish = await dishService.createDish(input);
      return formatDish(dish);
    },

    updateDish: async (_: any, { id, input }: { id: number; input: any }) => {
      const dish = await dishService.updateDish(id, input);
      return formatDish(dish);
    },

    deleteDish: async (_: any, { id }: { id: number }) => {
      await dishService.deleteDish(id);
      return true;
    },

    // Menus
    createMenu: async (_: any, { input }: { input: any }) => {
      const menu = await menuService.createMenu(input);
      return formatMenu(menu);
    },

    updateMenu: async (_: any, { id, input }: { id: number; input: any }) => {
      const menu = await menuService.updateMenu(id, input);
      return formatMenu(menu);
    },

    deleteMenu: async (_: any, { id }: { id: number }) => {
      await menuService.deleteMenu(id);
      return true;
    },
  },
};