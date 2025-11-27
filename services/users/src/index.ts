import express from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorHandler";
import logger from "./utils/logger";

dotenv.config();

const app = express();
app.use(express.json());

//error handler
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  logger.info(`Users service running on port ${process.env.PORT}`);
});
