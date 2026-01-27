import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import catchAsync from "../utils/catchAsync";
import logger from "../utils/logger";
import * as HttpStatusCode from "../constants/httpStatusCode";

/*
 #swagger.tags = ['Users']
 #swagger.summary = 'Get all users'
 #swagger.description = 'Retrieve a list of all registered users. Requires authentication.'
 #swagger.security = [{ "bearerAuth": [] }]
 #swagger.responses[200] = { 
   description: 'Users retrieved successfully', 
   schema: { 
     success: true,
     count: 2,
     data: [
       {
         id: 1,
         email: 'john.doe@example.com',
         name: 'John Doe',
         created_at: '2026-01-27T12:00:00Z',
         updated_at: '2026-01-27T12:00:00Z'
       }
     ]
   } 
 }
 #swagger.responses[401] = { 
   description: 'Unauthorized - Invalid or missing JWT token',
   schema: { success: false, message: 'Unauthorized' }
 }
 */
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  logger.info("[UserController] GET /users - Request to get all users");

  const users = await UserService.getAllUsers();

  logger.info(`[UserController] Successfully returning ${users.length} users`);

  res.status(HttpStatusCode.OK).json({
    success: true,
    count: users.length,
    data: users,
  });
});

/*
 #swagger.tags = ['Users']
 #swagger.summary = 'Get user by ID'
 #swagger.description = 'Retrieve a specific user by their ID. Users can only access their own data.'
 #swagger.security = [{ "bearerAuth": [] }]
 #swagger.parameters['id'] = {
   in: 'path',
   description: 'User ID',
   required: true,
   type: 'integer'
 }
 #swagger.responses[200] = { 
   description: 'User retrieved successfully', 
   schema: { 
     success: true,
     data: {
       id: 1,
       email: 'john.doe@example.com',
       name: 'John Doe',
       created_at: '2026-01-27T12:00:00Z',
       updated_at: '2026-01-27T12:00:00Z'
     }
   } 
 }
 #swagger.responses[400] = { 
   description: 'Bad request - Missing user ID',
   schema: { success: false, message: 'User ID is required' }
 }
 #swagger.responses[401] = { 
   description: 'Unauthorized',
   schema: { success: false, message: 'Unauthorized' }
 }
 #swagger.responses[403] = { 
   description: 'Forbidden - Cannot access other users data',
   schema: { success: false, message: 'You can only access your own user data' }
 }
 */
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  logger.info(
    `[UserController] GET /users/${id} - Request to get user by ID`,
  );

  if (!id) {
    logger.warn("[UserController] User ID parameter is missing");
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (!userId) {
    logger.warn("[UserController] User ID is missing from JWT");
    return res.status(HttpStatusCode.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized",
    });
  }

  console.log(String(id), String(userId));

  if (String(id) !== String(userId)) {
    logger.warn(
      `[UserController] User ${userId} attempted to access user ${id}'s data`,
    );
    return res.status(HttpStatusCode.FORBIDDEN).json({
      success: false,
      message: "You can only access your own user data",
    });
  }

  const user = await UserService.getUserById(id);

  logger.info(
    `[UserController] Successfully returning user with ID: ${id}`,
  );

  res.status(HttpStatusCode.OK).json({
    success: true,
    data: user,
  });
});

/*
 #swagger.tags = ['Users', 'Authentication']
 #swagger.summary = 'Create new user (Register)'
 #swagger.description = 'Register a new user account. No authentication required.'
 #swagger.parameters['body'] = {
   in: 'body',
   description: 'User registration data',
   required: true,
   schema: {
     type: 'object',
     properties: {
       email: {
         type: 'string',
         example: 'john.doe@example.com',
         description: 'User email address'
       },
       name: {
         type: 'string',
         example: 'John Doe',
         description: 'User full name'
       },
       password: {
         type: 'string',
         example: 'SecurePassword123!',
         description: 'User password'
       }
     },
     required: ['email', 'name', 'password']
   }
 }
 #swagger.responses[201] = { 
   description: 'User created successfully', 
   schema: { 
     success: true,
     message: 'User created successfully',
     data: {
       id: 1,
       email: 'john.doe@example.com',
       name: 'John Doe',
       created_at: '2026-01-27T12:00:00Z',
       updated_at: '2026-01-27T12:00:00Z'
     }
   } 
 }
 #swagger.responses[400] = { 
   description: 'Bad request - Missing required fields',
   schema: { success: false, message: 'Email, name, and password are required' }
 }
 */
export const createUser = catchAsync(async (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  logger.info(
    `[UserController] POST /users - Request to create user with email: ${email}`,
  );

  if (!email || !name || !password) {
    logger.warn("[UserController] Missing required fields in request body");
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "Email, name, and password are required",
    });
  }

  const createdUser = await UserService.createUser(email, name, password);

  logger.info(
    `[UserController] Successfully created user with ID: ${createdUser.id}`,
  );

  res.status(HttpStatusCode.CREATED).json({
    success: true,
    message: "User created successfully",
    data: createdUser,
  });
});

/*
 #swagger.tags = ['Users']
 #swagger.summary = 'Delete user account'
 #swagger.description = 'Delete the authenticated users own account. Requires authentication.'
 #swagger.security = [{ "bearerAuth": [] }]
 #swagger.responses[200] = { 
   description: 'User deleted successfully', 
   schema: { 
     success: true,
     message: 'User deleted successfully',
     data: {
       id: 1,
       email: 'john.doe@example.com',
       name: 'John Doe'
     }
   } 
 }
 #swagger.responses[400] = { 
   description: 'Bad request',
   schema: { success: false, message: 'User ID is required' }
 }
 #swagger.responses[401] = { 
   description: 'Unauthorized',
   schema: { success: false, message: 'Unauthorized' }
 }
 */
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  logger.info(
    `[UserController] DELETE /users - Request to delete user ${userId}`,
  );

  if (!userId) {
    logger.warn("[UserController] User ID is missing from JWT");
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "User ID is required",
    });
  }

  const deletedUser = await UserService.deleteUser(userId as string);

  logger.info(`[UserController] Successfully deleted user with ID: ${userId}`);

  res.status(HttpStatusCode.OK).json({
    success: true,
    message: "User deleted successfully",
    data: deletedUser,
  });
});

/*
 #swagger.tags = ['Authentication']
 #swagger.summary = 'User login'
 #swagger.description = 'Authenticate a user and receive a JWT token for subsequent requests.'
 #swagger.parameters['body'] = {
   in: 'body',
   description: 'Login credentials',
   required: true,
   schema: {
     type: 'object',
     properties: {
       email: {
         type: 'string',
         example: 'john.doe@example.com',
         description: 'User email address'
       },
       password: {
         type: 'string',
         example: 'SecurePassword123!',
         description: 'User password'
       }
     },
     required: ['email', 'password']
   }
 }
 #swagger.responses[200] = { 
   description: 'Login successful', 
   schema: { $ref: '#/definitions/LoginResponse' }
 }
 #swagger.responses[400] = { 
   description: 'Bad request - Missing credentials',
   schema: { success: false, message: 'Email and password are required' }
 }
 #swagger.responses[401] = { 
   description: 'Invalid credentials',
   schema: { success: false, message: 'Invalid email or password' }
 }
 */
export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  logger.info(
    `[UserController] POST /login - Request to login with email: ${email}`,
  );

  if (!email || !password) {
    logger.warn("[UserController] Missing email or password in request body");
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const result = await UserService.loginUser(email, password);

  logger.info(
    `[UserController] Successfully logged in user with ID: ${result.id}`,
  );

  res.status(HttpStatusCode.OK).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

/*
 #swagger.tags = ['Users']
 #swagger.summary = 'Update user profile'
 #swagger.description = 'Update the authenticated users profile information. Requires authentication.'
 #swagger.security = [{ "bearerAuth": [] }]
 #swagger.parameters['body'] = {
   in: 'body',
   description: 'Updated user data (at least one field required)',
   required: true,
   schema: {
     type: 'object',
     properties: {
       email: {
         type: 'string',
         example: 'john.updated@example.com',
         description: 'New email address (optional)'
       },
       name: {
         type: 'string',
         example: 'John Updated',
         description: 'New full name (optional)'
       }
     }
   }
 }
 #swagger.responses[200] = { 
   description: 'User updated successfully', 
   schema: { 
     success: true,
     message: 'User updated successfully',
     data: {
       id: 1,
       email: 'john.updated@example.com',
       name: 'John Updated',
       created_at: '2026-01-27T12:00:00Z',
       updated_at: '2026-01-27T14:00:00Z'
     }
   } 
 }
 #swagger.responses[400] = { 
   description: 'Bad request',
   schema: { success: false, message: 'At least one field (email or name) must be provided' }
 }
 #swagger.responses[401] = { 
   description: 'Unauthorized',
   schema: { success: false, message: 'Unauthorized' }
 }
 */
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { email, name } = req.body;

  logger.info(`[UserController] PUT /users - Request to update user ${userId}`);

  if (!userId) {
    logger.warn("[UserController] User ID is missing from JWT");
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (!email && !name) {
    logger.warn(
      "[UserController] No fields provided to update for user ID: " + userId,
    );
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "At least one field (email or name) must be provided",
    });
  }

  const updatedUser = await UserService.updateUser(
    userId as string,
    email,
    name,
  );

  logger.info(`[UserController] Successfully updated user with ID: ${userId}`);

  res.status(HttpStatusCode.OK).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

/*
 #swagger.tags = ['Likes']
 #swagger.summary = 'Add liked dish'
 #swagger.description = 'Add a dish to the authenticated users liked dishes list.'
 #swagger.security = [{ "bearerAuth": [] }]
 #swagger.parameters['dishId'] = {
   in: 'path',
   description: 'Dish ID to like',
   required: true,
   type: 'integer'
 }
 #swagger.responses[201] = { 
   description: 'Dish liked successfully', 
   schema: { 
     success: true,
     message: 'Dish liked successfully',
     data: {
       user_id: 1,
       dish_id: 5,
       created_at: '2026-01-27T12:00:00Z'
     }
   } 
 }
 #swagger.responses[400] = { 
   description: 'Bad request',
   schema: { success: false, message: 'User ID and Dish ID are required' }
 }
 #swagger.responses[401] = { 
   description: 'Unauthorized',
   schema: { success: false, message: 'Unauthorized' }
 }
 */
export const addLikedDish = catchAsync(async (req: Request, res: Response) => {
  const { dishId } = req.params;
  const userId = (req as any).userId;

  logger.info(
    `[UserController] POST /likes/${dishId} - Add liked dish for user ${userId}`,
  );

  if (!userId || !dishId) {
    logger.warn("[UserController] Missing userId or dishId");
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "User ID and Dish ID are required",
    });
  }

  const liked = await UserService.addLikedDish(userId as string, dishId);

  logger.info(
    `[UserController] Successfully added liked dish ${dishId} for user ${userId}`,
  );

  res.status(HttpStatusCode.CREATED).json({
    success: true,
    message: "Dish liked successfully",
    data: liked,
  });
});

/*
 #swagger.tags = ['Likes']
 #swagger.summary = 'Get liked dishes for authenticated user'
 #swagger.description = 'Retrieve all dishes liked by the authenticated user.'
 #swagger.security = [{ "bearerAuth": [] }]
 #swagger.responses[200] = { 
   description: 'Liked dishes retrieved successfully', 
   schema: { 
     success: true,
     count: 3,
     data: [
       {
         user_id: 1,
         dish_id: 5,
         created_at: '2026-01-27T12:00:00Z'
       },
       {
         user_id: 1,
         dish_id: 8,
         created_at: '2026-01-27T13:00:00Z'
       }
     ]
   } 
 }
 #swagger.responses[400] = { 
   description: 'Bad request',
   schema: { success: false, message: 'User ID is required' }
 }
 #swagger.responses[401] = { 
   description: 'Unauthorized',
   schema: { success: false, message: 'Unauthorized' }
 }
 */
export const getLikedDishes = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;

    logger.info(
      `[UserController] GET /likes - Request to get liked dishes for user ${userId}`,
    );

    if (!userId) {
      logger.warn("[UserController] User ID is missing from JWT");
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "User ID is required",
      });
    }

    const likedDishes = await UserService.getLikedDishes(userId as string);

    logger.info(
      `[UserController] Successfully returning ${likedDishes.length} liked dishes for user ${userId}`,
    );

    res.status(HttpStatusCode.OK).json({
      success: true,
      count: likedDishes.length,
      data: likedDishes,
    });
  },
);

/*
 #swagger.tags = ['Likes']
 #swagger.summary = 'Get liked dishes by user ID'
 #swagger.description = 'Retrieve all dishes liked by a specific user. Public endpoint.'
 #swagger.parameters['id'] = {
   in: 'path',
   description: 'User ID',
   required: true,
   type: 'integer'
 }
 #swagger.responses[200] = { 
   description: 'Liked dishes retrieved successfully', 
   schema: { 
     success: true,
     count: 2,
     data: [
       {
         user_id: 1,
         dish_id: 5,
         created_at: '2026-01-27T12:00:00Z'
       }
     ]
   } 
 }
 */
export const getLikedDishesByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.id;

    logger.info(
      `[UserController] GET /:id/likes - Request to get liked dishes for user ${userId}`,
    );

    const likedDishes = await UserService.getLikedDishes(userId as string);

    logger.info(
      `[UserController] Successfully returning ${likedDishes.length} liked dishes for user ${userId}`,
    );

    res.status(HttpStatusCode.OK).json({
      success: true,
      count: likedDishes.length,
      data: likedDishes,
    });
  },
);
