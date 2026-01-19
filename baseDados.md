-- db menu

DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS dishes CASCADE;

CREATE TABLE dishes (
    id_dish SERIAL PRIMARY KEY,
    dish_name VARCHAR(255) NOT NULL,
    dish_description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE menus (
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

-- Inserir pratos
INSERT INTO dishes (dish_name, dish_description) VALUES
('Bife Grelhado', 'Bife de vaca grelhado com batatas'),
('Salmão Assado', 'Salmão no forno com legumes'),
('Salada Caesar', 'Salada leve com frango'),
('Lasanha Vegetariana', 'Lasanha com legumes'),
('Pizza Margherita', 'Pizza clássica italiana');

-- Inserir menu para lunch de 2026-01-20
INSERT INTO menus (dish_id, dish_category, menu_date, menu_period) VALUES
(1, 'meat', '2026-01-20', 'lunch'),
(2, 'fish', '2026-01-20', 'lunch'),
(3, 'diet', '2026-01-20', 'lunch'),
(4, 'vegetarian', '2026-01-20', 'lunch'),
(5, 'optional', '2026-01-20', 'lunch');


-- db orders

DROP TABLE IF EXISTS bookings CASCADE;

CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_menu UNIQUE (user_id, menu_id)  -- Um user não pode reservar o mesmo menu 2x
);


-- db users