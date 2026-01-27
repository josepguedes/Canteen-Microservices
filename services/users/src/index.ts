import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import errorHandler from "./middleware/errorHandler";
import logger from "./utils/logger";
import userRoutes from "./routes/user.routes";
import swaggerDocument from "./swagger-manual.json";

dotenv.config();

const app = express();
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: "Users Service API",
  customCss: '.swagger-ui .topbar { display: none }',
}));

app.use("/users", userRoutes);

app.get("/", (req, res) => {
  /* #swagger.ignore = true */
  res.status(200).send("Users service is healthy");
});

//error handler
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  logger.info(`Users service running on port ${process.env.PORT}`);
  logger.info(`Swagger documentation available at http://localhost:${process.env.PORT}/api-docs`);
});
