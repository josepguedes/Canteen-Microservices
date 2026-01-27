import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Users Service API',
    version: '1.0.0',
    description: 'API documentation for the Canteen Users microservice. This service handles user management, authentication, and user preferences (liked dishes).',
  },
  host: 'localhost:5002',
  schemes: ['http'],
  basePath: '/users',
  tags: [
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Authentication',
      description: 'Login and authentication endpoints',
    },
    {
      name: 'Likes',
      description: 'User dish preferences endpoints',
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
    User: {
      id: 1,
      email: 'john.doe@example.com',
      name: 'John Doe',
      created_at: '2026-01-27T12:00:00Z',
      updated_at: '2026-01-27T12:00:00Z',
    },
    UserCreateRequest: {
      $email: 'john.doe@example.com',
      $name: 'John Doe',
      $password: 'SecurePassword123!',
    },
    UserUpdateRequest: {
      email: 'john.updated@example.com',
      name: 'John Updated',
    },
    LoginRequest: {
      $email: 'john.doe@example.com',
      $password: 'SecurePassword123!',
    },
    LoginResponse: {
      success: true,
      message: 'Login successful',
      data: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
    LikedDish: {
      user_id: 1,
      dish_id: 5,
      created_at: '2026-01-27T12:00:00Z',
    },
    SuccessResponse: {
      success: true,
      message: 'Operation successful',
      data: {},
    },
    ErrorResponse: {
      success: false,
      message: 'Error message',
    },
  },
};

const outputFile = './src/swagger-output.json';
const routes = ['./src/routes/user.routes.ts'];

swaggerAutogen()(outputFile, routes, doc);
