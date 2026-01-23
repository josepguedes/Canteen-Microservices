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
  logger.info(`Fetching order with ID: ${id}`);

  const order = await orderService.getOrderById(Number(id));
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

  const orders = await orderService.getAllOrders();
  logger.info(`Retrieved ${orders.length} orders successfully`);

  res.status(HttpStatusCode.OK).json({
    status: "success",
    results: orders.length,
    data: orders,
  });
});

/*
 #swagger.tags = ['Orders']
 #swagger.summary = 'Get orders by user ID'
 #swagger.description = 'Retrieve all orders for a specific user'
 #swagger.parameters['userId'] = {
   in: 'path',
   description: 'User ID',
   required: true,
   type: 'integer'
 }
 #swagger.responses[200] = { 
   description: 'User orders retrieved successfully', 
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
         id: 3,
         userId: 1,
         items: [
           {
             menuItemId: 3,
             quantity: 1,
             price: 12.50
           }
         ],
         totalAmount: 12.50,
         status: 'completed',
         createdAt: '2026-01-10T14:00:00Z'
       }
     ]
   } 
 }
 #swagger.responses[404] = { 
   description: 'User not found',
   schema: {
     status: 'error',
     message: 'User not found'
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
  
  logger.info(`[OrderController] GET /orders/user/:userId - Fetching orders for authenticated user ${userId}`);

  if (!userId) {
    logger.warn("[OrderController] User ID is missing from JWT");
    return res.status(HttpStatusCode.UNAUTHORIZED).json({
      status: "error",
      message: "Unauthorized",
    });
  }

  const orders = await orderService.getOrdersByUserId(userId);
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
 #swagger.description = 'Create a new order with items'
 #swagger.parameters['body'] = {
   in: 'body',
   description: 'Order data',
   required: true,
   schema: {
     userId: 1,
     items: [
       {
         menuItemId: 1,
         quantity: 2,
         price: 9.99
       }
     ],
     totalAmount: 19.98,
     status: 'pending'
   }
 }
 #swagger.responses[201] = { 
   description: 'Order created successfully', 
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
 #swagger.responses[400] = { 
   description: 'Invalid input data',
   schema: {
     status: 'error',
     message: 'Invalid input data'
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
  
  // Extract user_id from JWT token
  const userId = (req as any).userId;
  
  if (!userId) {
    logger.warn("[OrderController] User ID is missing from JWT");
    return res.status(HttpStatusCode.UNAUTHORIZED).json({
      status: "error",
      message: "Unauthorized - User ID not found in token",
    });
  }

  // Merge user_id from token with request body
  const orderData = {
    ...req.body,
    user_id: userId
  };

  logger.info(`Creating order for authenticated user ${userId}`);
  const order = await orderService.createOrder(orderData);
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
  logger.info(`Updating order with ID: ${id}`);

  const order = await orderService.updateOrder(Number(id), req.body);
  logger.info(`Order ${id} updated successfully`);

  res.status(HttpStatusCode.OK).json({
    status: "success",
    data: order,
  });
});

/*
 #swagger.tags = ['Orders']
 #swagger.summary = 'Update order status'
 #swagger.description = 'Update the status of an existing order'
 #swagger.parameters['id'] = {
   in: 'path',
   description: 'Order ID',
   required: true,
   type: 'integer'
 }
 #swagger.parameters['body'] = {
   in: 'body',
   description: 'New status',
   required: true,
   schema: {
     status: 'completed'
   }
 }
 #swagger.responses[200] = { 
   description: 'Order status updated successfully', 
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
       status: 'completed',
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
 #swagger.responses[400] = { 
   description: 'Invalid status',
   schema: {
     status: 'error',
     message: 'Invalid status'
   }
 }
 #swagger.responses[500] = { 
   description: 'Error updating order status',
   schema: {
     status: 'error',
     message: 'Error updating order status',
     error: 'Internal server error'
   }
 }
 */
export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  logger.info('Updating order status');

  const { id } = req.params;
  const { status } = req.body;
  logger.info(`Updating status for order ${id} to: ${status}`);

  const order = await orderService.updateOrderStatus(Number(id), status);
  logger.info(`Order ${id} status updated successfully to: ${status}`);

  res.status(HttpStatusCode.OK).json({
    status: "success",
    data: order,
  });
});

/*
 #swagger.tags = ['Orders']
 #swagger.summary = 'Delete order'
 #swagger.description = 'Delete an existing order by ID'
 #swagger.parameters['id'] = {
   in: 'path',
   description: 'Order ID',
   required: true,
   type: 'integer'
 }
 #swagger.responses[200] = { 
   description: 'Order deleted successfully', 
   schema: { 
     status: 'success',
     message: 'Order deleted successfully'
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
  logger.info(`Deleting order with ID: ${id}`);

  await orderService.deleteOrder(Number(id));
  logger.info(`Order ${id} deleted successfully`);

  res.status(HttpStatusCode.OK).json({
    status: "success",
    message: "Order deleted successfully",
  });
});

// Cancel order
export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  logger.info('Cancelling order');
  const { id } = req.params;
  logger.info(`Cancelling order with ID: ${id}`);
  const order = await orderService.cancelOrder(Number(id));
  logger.info(`Order ${id} cancelled successfully`);
  res.status(HttpStatusCode.OK).json({
    status: "success",
    data: order,
  });
});