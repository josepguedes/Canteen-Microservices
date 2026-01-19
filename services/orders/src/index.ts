import express from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorHandler";
import logger from "./utils/logger";
import orderRoutes from "./routes/order.routes";

dotenv.config();

const app = express();
app.use(express.json());


// Routes
app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 5001;

app.use(errorHandler);

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  logger.info(`Orders service running on port ${PORT} - ${url}`);
});

app.use(errorHandler);