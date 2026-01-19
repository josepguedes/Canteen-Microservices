export type DishCategory = 'meat' | 'fish' | 'diet' | 'vegetarian' | 'optional';

export interface Dish {
  id_dish: number;
  dish_name: string;
  dish_description?: string;
  created_at: Date;
}

export interface CreateDishInput {
  dish_name: string;
  dish_description?: string;
}

export interface UpdateDishInput {
  dish_name?: string;
  dish_description?: string;
}