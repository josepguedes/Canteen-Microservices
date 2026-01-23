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

  // Fetch menu details to check the meal time
  let menuDetails;
  try {
    menuDetails = await getMenuById(menu_id);
  } catch (error) {
    logger.error(`Failed to fetch menu details for menu_id ${menu_id}`);
    throw new AppError(
      "Invalid menu_id: menu not found",
      HttpStatusCode.BAD_REQUEST
    );
  }

  // Validate that order is being placed at least 2 hours before meal time
  if (menuDetails.menu_date && menuDetails.start_time) {
    const mealDateTime = new Date(`${menuDetails.menu_date}T${menuDetails.start_time}`);
    const now = new Date();
    const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const timeUntilMeal = mealDateTime.getTime() - now.getTime();

    if (timeUntilMeal < twoHoursInMs) {
      logger.error(`Order attempt for menu ${menu_id} is less than 2 hours before meal time`);
      throw new AppError(
        "Orders must be placed at least 2 hours before the meal time",
        HttpStatusCode.BAD_REQUEST
      );
    }
  }

  logger.info(`Creating order for user ${user_id}, menu_id: ${menu_id}`);

  return await OrderModel.create(orderData);
};

// Update an existing order
export const updateOrder = async (
  id: number,
  orderData: Partial<IBooking>
): Promise<IBooking> => {
  
  const order = await getOrderById(id);

  // If status is being changed to 'cancelled', check the 2-hour rule
  if (orderData.status === 'cancelled') {
    if (order.menu_details && order.menu_details.menu_date && order.menu_details.start_time) {
      const mealDateTime = new Date(`${order.menu_details.menu_date}T${order.menu_details.start_time}`);
      const now = new Date();
      const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      const timeUntilMeal = mealDateTime.getTime() - now.getTime();

      if (timeUntilMeal < twoHoursInMs) {
        logger.error(`Cancellation attempt for order ${id} is less than 2 hours before meal time`);
        throw new AppError(
          "Orders can only be cancelled at least 2 hours before the meal time",
          HttpStatusCode.BAD_REQUEST
        );
      }
    }
  }

  logger.info(`Updating order ${id}`);
  return await OrderModel.update(id, orderData);
};

// Update order status only
export const updateOrderStatus = async (
  id: number,
  status: BookingStatus
): Promise<IBooking> => {
  
  const order = await getOrderById(id);

  // Validate status
  if (!OrderModel.validateStatus(status)) {
    logger.error(`Invalid status value: ${status} for order ${id}`);
    throw new AppError(
      "Invalid status value",
      HttpStatusCode.BAD_REQUEST
    );
  }

  // Check if the order is being cancelled and verify the 2-hour rule
  if (status === 'cancelled') {
    if (order.menu_details && order.menu_details.menu_date && order.menu_details.start_time) {
      const mealDateTime = new Date(`${order.menu_details.menu_date}T${order.menu_details.start_time}`);
      const now = new Date();
      const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      const timeUntilMeal = mealDateTime.getTime() - now.getTime();

      if (timeUntilMeal < twoHoursInMs) {
        logger.error(`Cancellation attempt for order ${id} is less than 2 hours before meal time`);
        throw new AppError(
          "Orders can only be cancelled at least 2 hours before the meal time",
          HttpStatusCode.BAD_REQUEST
        );
      }
    }
  }

  logger.info(`Updating order ${id} status to ${status}`);
  return await OrderModel.updateStatus(id, status);
};

// Delete an order
export const deleteOrder = async (id: number): Promise<void> => {
  
  await getOrderById(id);

  logger.info(`Deleting order ${id}`);
  await OrderModel.remove(id);
  logger.info(`Order ${id} deleted successfully`);
};

// Get Orders for the logged-in user with JWT
export const getOrdersForUser = async (userId: number): Promise<any[]> => {
  const orders = await OrderModel.findByUserId(userId);
  
  
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