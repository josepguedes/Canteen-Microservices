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