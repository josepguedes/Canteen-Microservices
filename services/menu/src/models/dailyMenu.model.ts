export type MenuPeriod = 'lunch' | 'dinner';
export type DishCategory = 'meat' | 'fish' | 'diet' | 'vegetarian' | 'optional';

export interface Menu {
  id_menu: number;
  dish_id: number;
  period_id: number; 
  dish_category: DishCategory;
  menu_date: Date;
  created_at: Date;
}

export interface CreateMenuInput {
  dish_id: number;
  dish_category: DishCategory;
  menu_date: string;
  period_id: number;
}

export interface UpdateMenuInput {
  dish_id?: number;
  dish_category?: DishCategory;
  menu_date?: string;
  period_id?: number; 
}

export interface MenuWithDish extends Menu {
  dish_name: string;
  dish_description?: string;
  menu_period?: MenuPeriod;
  start_time?: string;
  end_time?: string;
}