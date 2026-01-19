# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run compile

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port (default 3000, can be overridden by environment variable)
EXPOSE 5002

# Run the application
CMD ["npm", "start"]
