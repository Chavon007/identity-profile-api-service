import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./config/dataabase.js";
import profileRoute from "./route/profileRoute.js";
import cookieParser from "cookie-parser";
import authRoutes from "./route/authRoute.js";
import requestLogger from "./middleware/logger.js";
import { apiVersionMiddleware } from "./middleware/apiVersionMiddleware.js";
dotenv.config();
const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());
app.use(requestLogger);
app.use(apiVersionMiddleware);
const PORT = 5000;

app.get("/", (req, res) => {
  res.send("Backend is running now");
});
app.use("/api", profileRoute);
app.use("/auth", authRoutes);
const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();
