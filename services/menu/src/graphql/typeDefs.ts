export const typeDefs = `#graphql
  """
  Represents a dish in the canteen menu system
  """
  type Dish {
    "Unique identifier for the dish"
    id_dish: Int!
    "Name of the dish"
    dish_name: String!
    "Detailed description of the dish"
    dish_description: String
    "Timestamp when the dish was created"
    created_at: String!
  }

  """
  Represents a time period for serving meals (breakfast, lunch, dinner)
  """
  type PeriodTime {
    "Unique identifier for the period"
    id: Int!
    "Name of the meal period (e.g., breakfast, lunch, dinner)"
    menu_period: String!
    "Start time for this meal period (HH:MM:SS format)"
    start_time: String!
    "End time for this meal period (HH:MM:SS format)"
    end_time: String!
    "Timestamp when the period was created"
    created_at: String!
  }

  """
  Represents a menu entry linking a dish to a specific date and period
  """
  type Menu {
    "Unique identifier for the menu entry"
    id_menu: Int!
    "Reference to the dish ID"
    dish_id: Int!
    "Reference to the period ID"
    period_id: Int!
    "Category of the dish (e.g., appetizer, main, dessert, beverage)"
    dish_category: String!
    "Date when this menu item is available (YYYY-MM-DD format)"
    menu_date: String!
    "Timestamp when the menu was created"
    created_at: String!
  }

  """
  Enhanced menu type with complete dish and period information
  Includes all details needed to display a full menu item
  """
  type MenuWithDish {
    "Unique identifier for the menu entry"
    id_menu: Int!
    "Reference to the dish ID"
    dish_id: Int!
    "Reference to the period ID"
    period_id: Int!
    "Category of the dish"
    dish_category: String!
    "Date when this menu item is available"
    menu_date: String!
    "Name of the dish"
    dish_name: String!
    "Description of the dish"
    dish_description: String
    "Meal period name"
    menu_period: String!
    "Start time for the meal period"
    start_time: String!
    "End time for the meal period"
    end_time: String!
    "Timestamp when created"
    created_at: String!
  }

  """
  Input for creating a new dish
  """
  input CreateDishInput {
    "Name of the dish (required)"
    dish_name: String!
    "Description of the dish (optional)"
    dish_description: String
  }

  """
  Input for updating an existing dish
  """
  input UpdateDishInput {
    "New name for the dish (optional)"
    dish_name: String
    "New description for the dish (optional)"
    dish_description: String
  }

  """
  Input for creating a new meal period
  """
  input CreatePeriodTimeInput {
    "Name of the meal period (required, e.g., 'breakfast', 'lunch', 'dinner')"
    menu_period: String!
    "Start time in HH:MM:SS format (required)"
    start_time: String!
    "End time in HH:MM:SS format (required)"
    end_time: String!
  }

  """
  Input for updating an existing meal period
  """
  input UpdatePeriodTimeInput {
    "New name for the meal period (optional)"
    menu_period: String
    "New start time (optional)"
    start_time: String
    "New end time (optional)"
    end_time: String
  }

  """
  Input for creating a new menu entry
  """
  input CreateMenuInput {
    "ID of the dish to add to the menu (required)"
    dish_id: Int!
    "ID of the meal period (required)"
    period_id: Int!
    "Category of the dish (required, e.g., 'appetizer', 'main', 'dessert', 'beverage')"
    dish_category: String!
    "Date for this menu entry in YYYY-MM-DD format (required)"
    menu_date: String!
  }

  """
  Input for updating an existing menu entry
  """
  input UpdateMenuInput {
    "New dish ID (optional)"
    dish_id: Int
    "New period ID (optional)"
    period_id: Int
    "New dish category (optional)"
    dish_category: String
    "New menu date (optional)"
    menu_date: String
  }

  type Query {
    """
    Get all dishes
    Returns: List of all available dishes in the system
    """
    dishes: [Dish!]!
    
    """
    Get a specific dish by its ID
    """
    dishById(id: Int!): Dish
    
    """
    Search dishes by name (partial match)
    """
    dishByName(name: String!): [Dish!]!

    """
    Get all meal periods
    Returns: List of all defined meal periods (breakfast, lunch, dinner, etc.)
    """
    periods: [PeriodTime!]!
    
    """
    Get a specific meal period by its ID
    """
    periodById(id: Int!): PeriodTime

    """
    Get all menu entries with full details
    Returns: Complete list of all menus with dish and period information
    """
    allMenus: [MenuWithDish!]!
    
    """
    Get a specific menu entry by its ID
    """
    menuById(id: Int!): MenuWithDish
    
    """
    Get menus for a specific date, optionally filtered by meal period
    Example: menusByDate(date: "2026-01-27", menuPeriod: "lunch")
    """
    menusByDate(date: String!, menuPeriod: String): [MenuWithDish!]!
    
    """
    Get today's menu, optionally filtered by meal period
    Example: todayMenu(menuPeriod: "lunch")
    """
    todayMenu(menuPeriod: String): [MenuWithDish!]!
  }

  type Mutation {
    """
    Create a new dish
    """
    createDish(input: CreateDishInput!): Dish!
    
    """
    Update an existing dish
    """
    updateDish(id: Int!, input: UpdateDishInput!): Dish!
    
    """
    Delete a dish
    Note: This will fail if the dish is referenced in any menus
    """
    deleteDish(id: Int!): Boolean!

    """
    Create a new meal period
    """
    createPeriod(input: CreatePeriodTimeInput!): PeriodTime!
    
    """
    Update an existing meal period
    """
    updatePeriod(id: Int!, input: UpdatePeriodTimeInput!): PeriodTime!
    
    """
    Delete a meal period
    Note: This will fail if the period is referenced in any menus
    """
    deletePeriod(id: Int!): Boolean!

    """
    Create a new menu entry
    """
    createMenu(input: CreateMenuInput!): Menu!
    
    """
    Update an existing menu entry
    """
    updateMenu(id: Int!, input: UpdateMenuInput!): Menu!
    
    """
    Delete a menu entry
    """
    deleteMenu(id: Int!): Boolean!
  }
`;
