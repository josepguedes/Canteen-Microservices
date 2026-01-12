import express from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorHandler";
import logger from "./utils/logger";
import orderRoutes from "./routes/order.routes";

dotenv.config();

const app = express();
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    service: "orders",
    timestamp: new Date().toISOString() 
  });
});

// Routes
app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n🚀 Orders service running at: ${url}`);
  logger.info(`Orders service running on port ${PORT}`);
});

app.use(errorHandler);