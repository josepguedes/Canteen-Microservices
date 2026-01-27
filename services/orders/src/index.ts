import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import errorHandler from "./middleware/errorHandler";
import logger from "./utils/logger";
import orderRoutes from "./routes/order.routes";
import swaggerDocument from "./swagger-manual.json";

dotenv.config();

const app = express();
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: "Orders Service API",
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Routes
app.use("/orders", orderRoutes);

app.get("/", (req, res) => {
  /* #swagger.ignore = true */
  res.status(200).send("Orders service is healthy");
});

const PORT = process.env.PORT || 5001;

app.use(errorHandler);

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  logger.info(`Orders service running on port ${PORT} - ${url}`);
  logger.info(`Swagger documentation available at ${url}/api-docs`);
});

app.use(errorHandler);