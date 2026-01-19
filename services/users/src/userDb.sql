-- PostgreSQL schema for the Users service
-- Matches the codebase expectations: users table with auth fields and a normalized
-- user_liked_dishes table storing only dish IDs (dish data lives in another microservice).

BEGIN;

-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core users table
CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	email TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	password TEXT NOT NULL, -- argon2 hash stored by the service
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User liked dishes (normalized, references users; dish data is external)
CREATE TABLE IF NOT EXISTS user_liked_dishes (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	dish_id TEXT NOT NULL, -- dish identifier from the dishes microservice
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (user_id, dish_id)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_user_liked_dishes_user ON user_liked_dishes (user_id);
CREATE INDEX IF NOT EXISTS idx_user_liked_dishes_dish ON user_liked_dishes (dish_id);

COMMIT;
