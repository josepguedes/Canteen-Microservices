-- db menu

DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS dishes CASCADE;

CREATE TABLE dishes (
    id_dish SERIAL PRIMARY KEY,
    dish_name VARCHAR(255) NOT NULL,
    dish_description TEXT,
    dish_category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE menus (
    id_menu SERIAL PRIMARY KEY,
    dish_id INTEGER NOT NULL,
    menu_date DATE NOT NULL,
    menu_period VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_dish
        FOREIGN KEY (dish_id)
        REFERENCES dishes(id_dish)
        ON DELETE CASCADE,
    CONSTRAINT unique_menu_entry
        UNIQUE (dish_id, menu_date, menu_period)
);


-- db orders

DROP TABLE IF EXISTS bookings CASCADE;

CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('lunch', 'dinner')),
    booking_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- db users