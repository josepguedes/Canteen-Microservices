import pool from '../config/database';

export type MealType = 'lunch' | 'dinner';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface IBooking {
    booking_id?: number;
    user_id: number;
    meal_type: MealType;
    booking_date: Date;
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
  const { user_id, meal_type, booking_date, status } = orderData;

  const result = await pool.query(
    `INSERT INTO bookings (user_id, meal_type, booking_date, status, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, NOW(), NOW()) 
     RETURNING *`,
    [user_id, meal_type, booking_date, status || "pending"]
  );

  return result.rows[0];
};

export const update = async (
  id: number,
  orderData: Partial<IBooking>
): Promise<IBooking> => {
  const { user_id, meal_type, booking_date, status } = orderData;

  const result = await pool.query(
    `UPDATE bookings 
     SET user_id = COALESCE($1, user_id),
         meal_type = COALESCE($2, meal_type),
         booking_date = COALESCE($3, booking_date),
         status = COALESCE($4, status),
         updated_at = NOW()
     WHERE booking_id = $5
     RETURNING *`,
    [user_id, meal_type, booking_date, status, id]
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
  const validStatuses: BookingStatus[] = ["pending", "confirmed", "cancelled", "completed"];
  return validStatuses.includes(status);
};