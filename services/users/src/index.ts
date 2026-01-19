import express from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorHandler";
import logger from "./utils/logger";
import userRoutes from "./routes/user.routes";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Users service is healthy");
});

//error handler
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  logger.info(`Users service running on port ${process.env.PORT}`);
});
