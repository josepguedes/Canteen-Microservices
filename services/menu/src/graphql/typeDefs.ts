export const typeDefs = `#graphql
  type Dish {
    id_dish: Int!
    dish_name: String!
    dish_description: String
    created_at: String!
  }

  type Menu {
    id_menu: Int!
    dish_id: Int!
    dish_category: String!
    menu_date: String!
    menu_period: String!
    created_at: String!
  }

  type MenuWithDish {
    id_menu: Int!
    dish_id: Int!
    dish_category: String!
    menu_date: String!
    menu_period: String!
    dish_name: String!
    dish_description: String
    created_at: String!
  }

  input CreateDishInput {
    dish_name: String!
    dish_description: String
  }

  input UpdateDishInput {
    dish_name: String
    dish_description: String
  }

  input CreateMenuInput {
    dish_id: Int!
    dish_category: String!
    menu_date: String!
    menu_period: String!
  }

  input UpdateMenuInput {
    dish_id: Int
    dish_category: String
    menu_date: String
    menu_period: String
  }

  type Query {
    # Dish queries
    dishes: [Dish!]!
    dishById(id: Int!): Dish
    dishByName(name: String!): [Dish!]!

    # Menu queries
    menus: [MenuWithDish!]!
    menusByDate(date: String!, menuPeriod: String): [MenuWithDish!]!
    menusByDateAndCategory(date: String!, menuPeriod: String!, dishCategory: String!): MenuWithDish
    todayMenu(menuPeriod: String): [MenuWithDish!]!
  }

  type Mutation {
    # Dish mutations
    createDish(input: CreateDishInput!): Dish!
    updateDish(id: Int!, input: UpdateDishInput!): Dish!
    deleteDish(id: Int!): Boolean!

    # Menu mutations
    createMenu(input: CreateMenuInput!): Menu!
    updateMenu(id: Int!, input: UpdateMenuInput!): Menu!
    deleteMenu(id: Int!): Boolean!
  }
`;