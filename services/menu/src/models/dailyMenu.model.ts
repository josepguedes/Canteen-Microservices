export type MenuPeriod = 'lunch' | 'dinner';
export type DishCategory = 'meat' | 'fish' | 'diet' | 'vegetarian' | 'optional';

export interface Menu {
  id_menu: number;
  dish_id: number;
  dish_category: DishCategory;
  menu_date: Date;
  menu_period: MenuPeriod;
  created_at: Date;
}

export interface CreateMenuInput {
  dish_id: number;
  dish_category: DishCategory;
  menu_date: string;
  menu_period: MenuPeriod;
}

export interface UpdateMenuInput {
  dish_id?: number;
  dish_category?: DishCategory;
  menu_date?: string;
  menu_period?: MenuPeriod;
}

export interface MenuWithDish extends Menu {
  dish_name: string;
  dish_description?: string;
}