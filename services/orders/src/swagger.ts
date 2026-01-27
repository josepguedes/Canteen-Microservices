import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Orders Service API',
    version: '1.0.0',
    description: `API documentation for the Canteen Orders microservice. This service handles order management for menu items.
    
**Important Business Rules:**
- Orders must be placed at least 2 hours before the meal time
- Orders can only be cancelled at least 2 hours before the meal time
- User ID is automatically extracted from JWT token for order creation`,
  },
  host: 'localhost:5001',
  schemes: ['http'],
  basePath: '/orders',
  tags: [
    {
      name: 'Orders',
      description: 'Order management endpoints',
    },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter your bearer token in the format: Bearer {token}',
    },
  },
  definitions: {
    Order: {
      booking_id: 1,
      user_id: 1,
      menu_id: 1,
      status: 'confirmed',
      created_at: '2026-01-27T10:00:00Z',
      updated_at: '2026-01-27T10:00:00Z',
    },
    OrderWithMenuDetails: {
      booking_id: 1,
      user_id: 1,
      menu_id: 1,
      status: 'confirmed',
      created_at: '2026-01-27T10:00:00Z',
      updated_at: '2026-01-27T10:00:00Z',
      menu_details: {
        id_menu: 1,
        dish_name: 'Grilled Chicken',
        menu_date: '2026-01-27',
        start_time: '12:00:00',
        end_time: '14:00:00',
        menu_period: 'lunch',
      },
    },
    CreateOrderRequest: {
      $menu_id: 1,
      status: 'confirmed',
    },
    UpdateOrderRequest: {
      status: 'cancelled',
    },
    SuccessResponse: {
      status: 'success',
      data: {},
    },
    ErrorResponse: {
      status: 'error',
      message: 'Error message',
    },
  },
};

const outputFile = './src/swagger-output.json';
const routes = ['./src/index.ts'];

swaggerAutogen()(outputFile, routes, doc);
