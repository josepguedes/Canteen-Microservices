import { IBooking, BookingStatus } from "../models/order.model";
import * as OrderModel from "../models/order.model";
import AppError from "../utils/AppError";
import * as HttpStatusCode from "../constants/httpStatusCode";
import { getMenuById } from "./menu.service";
import logger from "../utils/logger";

// Get order by ID
export const getOrderById = async (id: number): Promise<any> => {
  const order = await OrderModel.findById(id);

  if (!order) {
    logger.error(`Order with ID ${id} not found`);
    throw new AppError(
      "Order not found",
      HttpStatusCode.NOT_FOUND
    );
  }

  // Fetch menu details for this order
  try {
    const menu_details = await getMenuById(order.menu_id);
    return { ...order, menu_details };
  } catch (error) {
    logger.warn(`Failed to fetch menu details for menu_id ${order.menu_id}`);
    return { ...order, menu_details: null };
  }
};

// Get all orders
export const getAllOrders = async (): Promise<any[]> => {
  const orders = await OrderModel.findAll();
  
  // Fetch menu details for each order individually
  const ordersWithMenuDetails = await Promise.all(
    orders.map(async (order) => {
      try {
        const menu_details = await getMenuById(order.menu_id);
        return { ...order, menu_details };
      } catch (error) {
        logger.warn(`Failed to fetch menu details for menu_id ${order.menu_id}`);
        return { ...order, menu_details: null };
      }
    })
  );
  
  return ordersWithMenuDetails;
};

// Get orders by user and extract is id from token
export const getOrdersByUserId = async (userId: number | string): Promise<any[]> => {
  const orders = await OrderModel.findByUserId(userId);
  
  // Fetch menu details for each order individually
  const ordersWithMenuDetails = await Promise.all(
    orders.map(async (order) => {
      try {
        const menu_details = await getMenuById(order.menu_id);
        return { ...order, menu_details };
      } catch (error) {
        logger.warn(`Failed to fetch menu details for menu_id ${order.menu_id}`);
        return { ...order, menu_details: null };
      }
    })
  );
  
  return ordersWithMenuDetails;
};

// Create a new order
export const createOrder = async (orderData: IBooking): Promise<IBooking> => {
  const { user_id, menu_id } = orderData;

  // Validate required fields
  if (!user_id || !menu_id) {
    logger.error(`Missing required fields for order creation: user_id=${user_id}, menu_id=${menu_id}`);
    throw new AppError(
      "Missing required fields: menu_id is required",
      HttpStatusCode.BAD_REQUEST
    );
  }

  logger.info(`Creating order for user ${user_id}, menu_id: ${menu_id}`);

  return await OrderModel.create(orderData);
};

// Update an existing order
export const updateOrder = async (
  id: number,
  orderData: Partial<IBooking>
): Promise<IBooking> => {
  // First check if order exists
  await getOrderById(id);

  logger.info(`Updating order ${id}`);
  return await OrderModel.update(id, orderData);
};

// Update order status only
export const updateOrderStatus = async (
  id: number,
  status: BookingStatus
): Promise<IBooking> => {
  // First check if order exists
  await getOrderById(id);

  // Validate status
  if (!OrderModel.validateStatus(status)) {
    logger.error(`Invalid status value: ${status} for order ${id}`);
    throw new AppError(
      "Invalid status value",
      HttpStatusCode.BAD_REQUEST
    );
  }

  logger.info(`Updating order ${id} status to ${status}`);
  return await OrderModel.updateStatus(id, status);
};

// Delete an order
export const deleteOrder = async (id: number): Promise<void> => {
  // First check if order exists
  await getOrderById(id);

  logger.info(`Deleting order ${id}`);
  await OrderModel.remove(id);
  logger.info(`Order ${id} deleted successfully`);
};


// Cancel an order
export const cancelOrder = async (id: number): Promise<IBooking> => {
  // First check if order exists
  const order = await getOrderById(id);
  if (order.status === "cancelled") {
    logger.warn(`Order ${id} is already cancelled`);
    throw new AppError(
      "Order is already cancelled",
      HttpStatusCode.BAD_REQUEST
    );
  }

  const menuDetails = await getMenuById(order.menu_id);

  // Combine menu date and start time to create the meal datetime
  const menuDate = new Date(menuDetails.menu_date);
  const [hours, minutes] = menuDetails.start_time!.split(':').map(Number);

  // Create the exact datetime of the meal
  const mealDateTime = new Date(
    menuDate.getFullYear(),
    menuDate.getMonth(),
    menuDate.getDate(),
    hours,
    minutes,
    0
  );

  // Calculate the minimum cancellation time (2 hours before meal)
  const minimumCancellationTime = new Date(mealDateTime.getTime() - 2 * 60 * 60 * 1000);
  const now = new Date();

  // Check if we're still within the cancellation window
  if (now > minimumCancellationTime) {
    logger.warn(
      `Cancellation too late for order ${id}. Current time: ${now.toISOString()}, ` +
      `Minimum cancellation time: ${minimumCancellationTime.toISOString()}, ` +
      `Meal time: ${mealDateTime.toISOString()}`
    );
    throw new AppError(
      "Cannot cancel order. Cancellation must be done at least 2 hours before the meal time",
      HttpStatusCode.BAD_REQUEST
    );
  }

  logger.info(`Cancelling order ${id}. Time until meal: ${(mealDateTime.getTime() - now.getTime()) / (1000 * 60)} minutes`);
  return await OrderModel.updateStatus(id, "cancelled");
};


// Get Orders for the logged-in user with JWT
export const getOrdersForUser = async (userId: number): Promise<any[]> => {
  const orders = await OrderModel.findByUserId(userId);
  
  // Fetch menu details for each order individually
  const ordersWithMenuDetails = await Promise.all(
    orders.map(async (order) => {
      try {
        const menu_details = await getMenuById(order.menu_id);
        return { ...order, menu_details };
      } catch (error) {
        logger.warn(`Failed to fetch menu details for menu_id ${order.menu_id}`);
        return { ...order, menu_details: null };
      }
    })
  );
  
  return ordersWithMenuDetails;
};