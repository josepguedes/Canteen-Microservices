export const typeDefs = `#graphql
  type Dish {
    id_dish: Int!
    dish_name: String!
    dish_description: String
    created_at: String!
  }

  type PeriodTime {
    id: Int!
    menu_period: String!
    start_time: String!
    end_time: String!
    created_at: String!
  }

  type Menu {
    id_menu: Int!
    dish_id: Int!
    period_id: Int!
    dish_category: String!
    menu_date: String!
    created_at: String!
  }

  type MenuWithDish {
    id_menu: Int!
    dish_id: Int!
    period_id: Int!
    dish_category: String!
    menu_date: String!
    dish_name: String!
    dish_description: String
    menu_period: String!
    start_time: String!
    end_time: String!
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

  input CreatePeriodTimeInput {
    menu_period: String!
    start_time: String!
    end_time: String!
  }

  input UpdatePeriodTimeInput {
    menu_period: String
    start_time: String
    end_time: String
  }

  input CreateMenuInput {
    dish_id: Int!
    period_id: Int!
    dish_category: String!
    menu_date: String!
  }

  input UpdateMenuInput {
    dish_id: Int
    period_id: Int
    dish_category: String
    menu_date: String
  }

  type Query {
    # Dish queries
    dishes: [Dish!]!
    dishById(id: Int!): Dish
    dishByName(name: String!): [Dish!]!

    # Period queries
    periods: [PeriodTime!]!
    periodById(id: Int!): PeriodTime

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

    # Period mutations
    createPeriod(input: CreatePeriodTimeInput!): PeriodTime!
    updatePeriod(id: Int!, input: UpdatePeriodTimeInput!): PeriodTime!
    deletePeriod(id: Int!): Boolean!

    # Menu mutations
    createMenu(input: CreateMenuInput!): Menu!
    updateMenu(id: Int!, input: UpdateMenuInput!): Menu!
    deleteMenu(id: Int!): Boolean!
  }
`;