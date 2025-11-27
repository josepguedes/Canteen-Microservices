import express from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorHandler";

dotenv.config();

const app = express();
app.use(express.json());

//error handler
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Users service running on port ${process.env.PORT}`);
});
