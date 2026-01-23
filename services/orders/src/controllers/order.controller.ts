import catchAsync from "../utils/catchAsync";
import { Request, Response } from "express";
import * as orderService from "../services/order.service";
import * as HttpStatusCode from "../constants/httpStatusCode";
import logger from "../utils/logger";

/*
 #swagger.tags = ['Orders']
 #swagger.summary = 'Get order by ID'
 #swagger.description = 'Retrieve a specific order by its ID'
 #swagger.parameters['id'] = {
   in: 'path',
   description: 'Order ID',
   required: true,
   type: 'integer'
 }
 #swagger.responses[200] = { 
   description: 'Order retrieved successfully', 
   schema: { 
     status: 'success',
     data: {
       id: 1,
       userId: 1,
       items: [
         {
           menuItemId: 1,
           quantity: 2,
           price: 9.99
         }
       ],
       totalAmount: 19.98,
       status: 'pending',
       createdAt: '2026-01-10T12:00:00Z'
     }
   } 
 }
 #swagger.responses[404] = { 
   description: 'Order not found',
   schema: {
     status: 'error',
     message: 'Order not found'
   }
 }
 #swagger.responses[500] = { 
   description: 'Error retrieving order',
   schema: {
     status: 'error',
     message: 'Error retrieving order',
     error: 'Internal server error'
   }
 }
 */
export const getOrder = catchAsync(async (req: Request, res: Response) => {
  logger.info('Fetching order by ID');

  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  logger.info(`Fetching order with ID: ${id}`);

  const order = await orderService.getOrderById(Number(id), token);
  logger.info(`Order ${id} retrieved successfully`);

  res.status(HttpStatusCode.OK).json({
    status: "success",
    data: order,
  });
});

/*
 #swagger.tags = ['Orders']
 #swagger.summary = 'Get all orders'
 #swagger.description = 'Retrieve a list of all orders'
 #swagger.responses[200] = { 
   description: 'Orders retrieved successfully', 
   schema: { 
     status: 'success',
     results: 2,
     data: [
       {
         id: 1,
         userId: 1,
         items: [
           {
             menuItemId: 1,
             quantity: 2,
             price: 9.99
           }
         ],
         totalAmount: 19.98,
         status: 'pending',
         createdAt: '2026-01-10T12:00:00Z'
       },
       {
         id: 2,
         userId: 2,
         items: [
           {
             menuItemId: 2,
             quantity: 1,
             price: 15.99
           }
         ],
         totalAmount: 15.99,
         status: 'completed',
         createdAt: '2026-01-10T13:00:00Z'
       }
     ]
   } 
 }
 #swagger.responses[500] = { 
   description: 'Error retrieving orders',
   schema: {
     status: 'error',
     message: 'Error retrieving orders',
     error: 'Internal server error'
   }
 }
 */
export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  logger.info('Fetching all orders');

  const token = req.headers.authorization?.split(' ')[1];
  const orders = await orderService.getAllOrders(token);
  logger.info(`Retrieved ${orders.length} orders successfully`);

  res.status(HttpStatusCode.OK).json({
    status: "success",
    results: orders.length,
    data: orders,
  });
});

/*
 #swagger.tags = ['Orders']
 #swagger.summary = 'Get orders for authenticated user'
 #swagger.description = 'Retrieve all orders for the currently logged-in user. User ID is extracted from JWT token automatically.'
 #swagger.responses[200] = { 
   description: 'User orders retrieved successfully. Each order includes enriched menu details.', 
   schema: { 
     status: 'success',
     results: 2,
     data: [
       {
         booking_id: 1,
         user_id: 1,
         menu_id: 1,
         status: 'confirmed',
         created_at: '2026-01-23T10:00:00Z',
         updated_at: '2026-01-23T10:00:00Z',
         menu_details: {
           id_menu: 1,
           dish_name: 'Grilled Chicken',
           menu_date: '2026-01-23',
           start_time: '12:00:00',
           end_time: '14:00:00',
           menu_period: 'lunch'
         }
       }
     ]
   } 
 }
 #swagger.responses[401] = { 
   description: 'Unauthorized - Invalid or missing JWT token',
   schema: {
     status: 'error',
     message: 'Unauthorized'
   }
 }
 #swagger.responses[500] = { 
   description: 'Error retrieving user orders',
   schema: {
     status: 'error',
     message: 'Error retrieving user orders',
     error: 'Internal server error'
   }
 }
 */
export const getOrdersByUser = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const token = req.headers.authorization?.split(' ')[1];
  
  logger.info(`[OrderController] GET /orders/user/:userId - Fetching orders for authenticated user ${userId}`);

  if (!userId) {
    logger.warn("[OrderController] User ID is missing from JWT");
    return res.status(HttpStatusCode.UNAUTHORIZED).json({
      status: "error",
      message: "Unauthorized",
    });
  }

  const orders = await orderService.getOrdersByUserId(userId, token);
  logger.info(`Retrieved ${orders.length} orders for user ${userId}`);

  res.status(HttpStatusCode.OK).json({
    status: "success",
    results: orders.length,
    data: orders,
  });
});

/*
 #swagger.tags = ['Orders']
 #swagger.summary = 'Create new order'
 #swagger.description = 'Create a new order for a menu item. IMPORTANT: Orders must be placed at least 2 hours before the meal time. User ID is automatically extracted from JWT token.'
 #swagger.parameters['body'] = {
   in: 'body',
   description: 'Order data - only menu_id and optional status are required. User ID comes from JWT token.',
   required: true,
   schema: {
     menu_id: 1,
     status: 'confirmed'
   }
 }
 #swagger.responses[201] = { 
   description: 'Order created successfully', 
   schema: { 
     status: 'success',
     data: {
       booking_id: 1,
       user_id: 1,
       menu_id: 1,
       status: 'confirmed',
       created_at: '2026-01-23T12:00:00Z',
       updated_at: '2026-01-23T12:00:00Z'
     }
   } 
 }
 #swagger.responses[400] = { 
   description: 'Invalid input data or order placed less than 2 hours before meal time',
   schema: {
     status: 'error',
     message: 'Orders must be placed at least 2 hours before the meal time'
   }
 }
 #swagger.responses[500] = { 
   description: 'Error creating order',
   schema: {
     status: 'error',
     message: 'Error creating order',
     error: 'Internal server error'
   }
 }
 */
export const createOrder = catchAsync(async (req: Request, res: Response) => {
  logger.info('Creating new order');
  
  // Extract user_id from JWT token (added by verifyJWT middleware)
  const userId = (req as any).userId;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!userId) {
    logger.warn("[OrderController] User ID is missing from JWT");
    return res.status(HttpStatusCode.UNAUTHORIZED).json({
      status: "error",
      message: "Unauthorized - User ID not found in token",
    });
  }

  // Merge user_id from token with request body
  // This ensures users can only create orders for themselves
  const orderData = {
    ...req.body,
    user_id: userId
  };

  logger.info(`Creating order for authenticated user ${userId}`);
  const order = await orderService.createOrder(orderData, token);
  logger.info(`Order created successfully with ID: ${order.booking_id}`);

  res.status(HttpStatusCode.CREATED).json({
    status: "success",
    data: order,
  });
});

/*
 #swagger.tags = ['Orders']
 #swagger.summary = 'Update order'
 #swagger.description = 'Update an existing order'
 #swagger.parameters['id'] = {
   in: 'path',
   description: 'Order ID',
   required: true,
   type: 'integer'
 }
 #swagger.parameters['body'] = {
   in: 'body',
   description: 'Updated order data',
   required: true,
   schema: {
     items: [
       {
         menuItemId: 1,
         quantity: 3,
         price: 9.99
       }
     ],
     totalAmount: 29.97
   }
 }
 #swagger.responses[200] = { 
   description: 'Order updated successfully', 
   schema: { 
     status: 'success',
     data: {
       id: 1,
       userId: 1,
       items: [
         {
           menuItemId: 1,
           quantity: 3,
           price: 9.99
         }
       ],
       totalAmount: 29.97,
       status: 'pending',
       createdAt: '2026-01-10T12:00:00Z',
       updatedAt: '2026-01-10T13:00:00Z'
     }
   } 
 }
 #swagger.responses[404] = { 
   description: 'Order not found',
   schema: {
     status: 'error',
     message: 'Order not found'
   }
 }
 #swagger.responses[500] = { 
   description: 'Error updating order',
   schema: {
     status: 'error',
     message: 'Error updating order',
     error: 'Internal server error'
   }
 }
 */
export const updateOrder = catchAsync(async (req: Request, res: Response) => {

  logger.info('Updating order');

  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  logger.info(`Updating order with ID: ${id}`);

  const order = await orderService.updateOrder(Number(id), req.body, token);
  logger.info(`Order ${id} updated successfully`);

  res.status(HttpStatusCode.OK).json({
    status: "success",
    data: order,
  });
});

/*
 #swagger.tags = ['Orders']
 #swagger.summary = 'Delete/Cancel order'
 #swagger.description = 'Delete an existing order by ID. IMPORTANT: Orders can only be cancelled at least 2 hours before the meal time. This is a permanent deletion (hard delete).'
 #swagger.parameters['id'] = {
   in: 'path',
   description: 'Order ID',
   required: true,
   type: 'integer'
 }
 #swagger.responses[200] = { 
   description: 'Order deleted/cancelled successfully', 
   schema: { 
     status: 'success',
     message: 'Order deleted successfully'
   } 
 }
 #swagger.responses[400] = { 
   description: 'Cancellation attempted less than 2 hours before meal time',
   schema: {
     status: 'error',
     message: 'Orders can only be cancelled at least 2 hours before the meal time'
   }
 }
 #swagger.responses[404] = { 
   description: 'Order not found',
   schema: {
     status: 'error',
     message: 'Order not found'
   }
 }
 #swagger.responses[500] = { 
   description: 'Error deleting order',
   schema: {
     status: 'error',
     message: 'Error deleting order',
     error: 'Internal server error'
   }
 }
 */
export const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  logger.info('Deleting order');

  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  logger.info(`Deleting order with ID: ${id}`);

  await orderService.deleteOrder(Number(id), token);
  logger.info(`Order ${id} deleted successfully`);

  res.status(HttpStatusCode.OK).json({
    status: "success",
    message: "Order deleted successfully",
  });
});