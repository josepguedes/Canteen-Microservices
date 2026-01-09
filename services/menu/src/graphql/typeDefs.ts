export const typeDefs = `#graphql
  type Dish {
    id_dish: Int!
    dish_name: String!
    dish_description: String
    dish_category: String!
    created_at: String!
  }

  type Menu {
    id_menu: Int!
    dish_id: Int!
    menu_date: String!
    menu_period: String!
    created_at: String!
  }

  type MenuWithDish {
    id_menu: Int!
    dish_id: Int!
    menu_date: String!
    menu_period: String!
    dish_name: String!
    dish_description: String
    dish_category: String!
    created_at: String!
  }

  input CreateDishInput {
    dish_name: String!
    dish_description: String
    dish_category: String!
  }

  input UpdateDishInput {
    dish_name: String
    dish_description: String
    dish_category: String
  }

  input CreateMenuInput {
    dish_id: Int!
    menu_date: String!
    menu_period: String!
  }

  input UpdateMenuInput {
    dish_id: Int
    menu_date: String
    menu_period: String
  }

  type Query {
    # Dishes
    dishes: [Dish!]!
    dishById(id: Int!): Dish!
    dishByName(name: String!): [Dish!]!
    dishesByCategory(category: String!): [Dish!]!

    # Menus
    menusByDate(date: String!, menuPeriod: String): [MenuWithDish!]!
    todayMenu(menuPeriod: String): [MenuWithDish!]!
  }

  type Mutation {
    # Dishes
    createDish(input: CreateDishInput!): Dish!
    updateDish(id: Int!, input: UpdateDishInput!): Dish!
    deleteDish(id: Int!): Boolean!

    # Menus
    createMenu(input: CreateMenuInput!): MenuWithDish!
    updateMenu(id: Int!, input: UpdateMenuInput!): MenuWithDish!
    deleteMenu(id: Int!): Boolean!
  }
`;