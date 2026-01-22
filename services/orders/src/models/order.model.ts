import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export type MealType = 'lunch' | 'dinner';
export type BookingStatus = 'pending' | 'cancelled' | 'completed';

export interface IBooking {
    booking_id?: number;
    user_id: number;
    menu_id: number;
    status: BookingStatus;
    created_at?: Date;
    updated_at?: Date;
}

// Model methods with database logic
export const findById = async (id: number): Promise<IBooking | null> => {
  const result = await pool.query(
    "SELECT * FROM bookings WHERE booking_id = $1",
    [id]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

export const findAll = async (): Promise<IBooking[]> => {
  const result = await pool.query(
    "SELECT * FROM bookings ORDER BY created_at DESC"
  );

  return result.rows;
};

export const findByUserId = async (userId: number): Promise<IBooking[]> => {
  const result = await pool.query(
    "SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );

  return result.rows;
};

export const create = async (orderData: IBooking): Promise<IBooking> => {
  const { user_id, menu_id, status } = orderData;

  const result = await pool.query(
    `INSERT INTO bookings (user_id, menu_id, status, created_at, updated_at) 
     VALUES ($1, $2, $3, NOW(), NOW()) 
     RETURNING *`,
    [user_id, menu_id, status || "pending"]
  );

  return result.rows[0];
};

export const update = async (
  id: number,
  orderData: Partial<IBooking>
): Promise<IBooking> => {
  const { user_id, menu_id, status } = orderData;

  const result = await pool.query(
    `UPDATE bookings 
     SET user_id = COALESCE($1, user_id),
         menu_id = COALESCE($2, menu_id),
         status = COALESCE($3, status),
         updated_at = NOW()
     WHERE booking_id = $4
     RETURNING *`,
    [user_id, menu_id, status, id]
  );

  return result.rows[0];
};

export const updateStatus = async (
  id: number,
  status: BookingStatus
): Promise<IBooking> => {
  const result = await pool.query(
    `UPDATE bookings 
     SET status = $1, updated_at = NOW()
     WHERE booking_id = $2
     RETURNING *`,
    [status, id]
  );

  return result.rows[0];
};

export const remove = async (id: number): Promise<void> => {
  await pool.query("DELETE FROM bookings WHERE booking_id = $1", [id]);
};

export const validateStatus = (status: BookingStatus): boolean => {
  const validStatuses: BookingStatus[] = ["pending", "cancelled", "completed"];
  return validStatuses.includes(status);
};