-- ============================================
-- USERS DATABASE
-- ============================================
CREATE DATABASE users_canteen;
\c users_canteen

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_liked_dishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dish_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, dish_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_user_liked_dishes_user ON user_liked_dishes (user_id);
CREATE INDEX IF NOT EXISTS idx_user_liked_dishes_dish ON user_liked_dishes (dish_id);

-- Insert sample users
-- Note: Password is 'password123' hashed with argon2
-- Use these credentials to login: test1@example.com / password123
INSERT INTO users (email, name, password) VALUES
('test1@example.com', 'João Silva', '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRoZXJl$OAJXKUHJHJHKJHKJHKJHKJHKJ'),
('test2@example.com', 'Maria Santos', '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRoZXJl$OAJXKUHJHJHKJHKJHKJHKJHKJ'),
('admin@canteen.com', 'Admin User', '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRoZXJl$OAJXKUHJHJHKJHKJHKJHKJHKJ');

-- Insert sample liked dishes (using dish IDs as text since they reference menu service)
INSERT INTO user_liked_dishes (user_id, dish_id)
SELECT u.id, '1' FROM users u WHERE u.email = 'test1@example.com'
UNION ALL
SELECT u.id, '2' FROM users u WHERE u.email = 'test1@example.com'
UNION ALL
SELECT u.id, '4' FROM users u WHERE u.email = 'test2@example.com';


-- ============================================
-- MENU DATABASE
-- ============================================
CREATE DATABASE menu_db;
\c menu_db

CREATE TABLE IF NOT EXISTS dishes (
    id_dish SERIAL PRIMARY KEY,
    dish_name VARCHAR(255) NOT NULL,
    dish_description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menus (
    id_menu SERIAL PRIMARY KEY,
    dish_id INTEGER NOT NULL,
    dish_category VARCHAR(100) NOT NULL CHECK (dish_category IN ('meat', 'fish', 'diet', 'vegetarian', 'optional')),
    menu_date DATE NOT NULL,
    menu_period VARCHAR(50) NOT NULL CHECK (menu_period IN ('lunch', 'dinner')),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_dish
        FOREIGN KEY (dish_id)
        REFERENCES dishes(id_dish)
        ON DELETE CASCADE,
    CONSTRAINT unique_category_per_menu_period
        UNIQUE (menu_date, menu_period, dish_category)
);

-- Insert sample dishes
INSERT INTO dishes (dish_name, dish_description) VALUES
('Bife Grelhado', 'Bife de vaca grelhado com batatas'),
('Salmão Assado', 'Salmão no forno com legumes'),
('Salada Caesar', 'Salada leve com frango'),
('Lasanha Vegetariana', 'Lasanha com legumes'),
('Pizza Margherita', 'Pizza clássica italiana');

-- Insert sample menu for lunch on 2026-01-20
INSERT INTO menus (dish_id, dish_category, menu_date, menu_period) VALUES
(1, 'meat', '2026-01-20', 'lunch'),
(2, 'fish', '2026-01-20', 'lunch'),
(3, 'diet', '2026-01-20', 'lunch'),
(4, 'vegetarian', '2026-01-20', 'lunch'),
(5, 'optional', '2026-01-20', 'lunch');


-- ============================================
-- ORDERS DATABASE
-- ============================================
CREATE DATABASE bookingdb;
\c bookingdb

CREATE TABLE IF NOT EXISTS bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_menu UNIQUE (user_id, menu_id)
);
