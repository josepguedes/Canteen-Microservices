import { Pool } from "pg";
import { IBooking, BookingStatus } from "../models/order.model";
import AppError from "../utils/AppError";
import * as HttpStatusCode from "../constants/httpStatusCode";
import dotenv from "dotenv";
import { log } from "node:console";

// Load environment variables
dotenv.config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Get order by ID
export const getOrderById = async (id: number): Promise<IBooking> => {
  const result = await pool.query(
    "SELECT * FROM bookings WHERE booking_id = $1",
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "Order not found",
      HttpStatusCode.NOT_FOUND
    );
  }

  return result.rows[0];
};

// Get all orders
export const getAllOrders = async (): Promise<IBooking[]> => {
  const result = await pool.query(
    "SELECT * FROM bookings ORDER BY created_at DESC"
  );

  return result.rows;
};

// Get orders by user ID
export const getOrdersByUserId = async (userId: number): Promise<IBooking[]> => {
  const result = await pool.query(
    "SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );

  return result.rows;
};

// Create a new order
export const createOrder = async (orderData: IBooking): Promise<IBooking> => {
  const { user_id, meal_type, booking_date, status } = orderData;

  console.log(orderData);

  // Validate required fields
  if (!user_id || !meal_type || !booking_date) {
    throw new AppError(
      "Missing required fields",
      HttpStatusCode.BAD_REQUEST
    );
  }

  const result = await pool.query(
    `INSERT INTO bookings (user_id, meal_type, booking_date, status, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
     RETURNING *`,
    [user_id, meal_type, booking_date, status || "pending"]
  );

  return result.rows[0];
};

// Update an existing order
export const updateOrder = async (
  id: number,
  orderData: Partial<IBooking>
): Promise<IBooking> => {
  // First check if order exists
  const existingOrder = await getOrderById(id);

  const { user_id, meal_type, booking_date, status } = orderData;

  const result = await pool.query(
    `UPDATE bookings 
     SET user_id = COALESCE($1, user_id),
         meal_type = COALESCE($3, meal_type),
         booking_date = COALESCE($4, booking_date),
         status = COALESCE($5, status),
         updated_at = NOW()
     WHERE booking_id = $6
     RETURNING *`,
    [user_id, meal_type, booking_date, status, id]
  );

  return result.rows[0];
};

// Update order status only
export const updateOrderStatus = async (
  id: number,
  status: BookingStatus
): Promise<IBooking> => {
  // First check if order exists
  await getOrderById(id);

  // Validate status
  const validStatuses: BookingStatus[] = ["pending", "confirmed", "cancelled", "completed"];
  if (!validStatuses.includes(status)) {
    throw new AppError(
      "Invalid status value",
      HttpStatusCode.BAD_REQUEST
    );
  }

  const result = await pool.query(
    `UPDATE bookings 
     SET status = $1, updated_at = NOW()
     WHERE booking_id = $2
     RETURNING *`,
    [status, id]
  );

  return result.rows[0];
};

// Delete an order
export const deleteOrder = async (id: number): Promise<void> => {
  // First check if order exists
  await getOrderById(id);

  await pool.query("DELETE FROM bookings WHERE booking_id = $1", [id]);
};
