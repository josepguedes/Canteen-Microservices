export interface Menu {
  id_menu: number;
  dish_id: number;
  menu_date: Date;
  menu_period: string;
  created_at: Date;
}

export interface CreateMenuInput {
  dish_id: number;
  menu_date: string;
  menu_period: string;
}

export interface UpdateMenuInput {
  dish_id?: number;
  menu_date?: string;
  menu_period?: string;
}

export interface MenuWithDish extends Menu {
  dish_name: string;
  dish_description?: string;
  dish_category: string;
}