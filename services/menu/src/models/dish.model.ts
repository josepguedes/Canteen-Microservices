export interface Dish {
  id_dish: number;
  dish_name: string;
  dish_description?: string;
  dish_category: string;
  created_at: Date;
}

export interface CreateDishInput {
  dish_name: string;
  dish_description?: string;
  dish_category: string;
}

export interface UpdateDishInput {
  dish_name?: string;
  dish_description?: string;
  dish_category?: string;
}