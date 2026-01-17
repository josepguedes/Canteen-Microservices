import { IBooking, BookingStatus } from "../models/order.model";
import * as OrderModel from "../models/order.model";
import AppError from "../utils/AppError";
import * as HttpStatusCode from "../constants/httpStatusCode";
import logger from "../utils/logger";


// Get order by ID
export const getOrderById = async (id: number): Promise<IBooking> => {
  const order = await OrderModel.findById(id);

  if (!order) {
    logger.error(`Order with ID ${id} not found`);
    throw new AppError(
      "Order not found",
      HttpStatusCode.NOT_FOUND
    );
  }

  return order;
};

// Get all orders
export const getAllOrders = async (): Promise<IBooking[]> => {
  return await OrderModel.findAll();
};

// Get orders by user ID
export const getOrdersByUserId = async (userId: number): Promise<IBooking[]> => {
  return await OrderModel.findByUserId(userId);
};

// Create a new order
export const createOrder = async (orderData: IBooking): Promise<IBooking> => {
  const { user_id, meal_type, booking_date } = orderData;

  // Validate required fields
  if (!user_id || !meal_type || !booking_date) {
    logger.error(`Missing required fields for order creation: user_id=${user_id}, meal_type=${meal_type}, booking_date=${booking_date}`);
    throw new AppError(
      "Missing required fields",
      HttpStatusCode.BAD_REQUEST
    );
  }

  logger.info(`Creating order for user ${user_id}, meal_type: ${meal_type}, date: ${booking_date}`);

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
