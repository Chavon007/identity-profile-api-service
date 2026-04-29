import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./config/dataabase.js";
import profileRoute from "./route/profileRoute.js";
import cookieParser from "cookie-parser";
import authRoutes from "./route/authRoute.js";
import requestLogger from "./middleware/logger.js";
import { authLimiter, otherLimiter } from "./utlis/rateLimiter.js";
import { apiVersionMiddleware } from "./middleware/apiVersionMiddleware.js";
dotenv.config();
const app = express();

app.use(cookieParser());
app.use(
  cors({
      origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(requestLogger);

const PORT = 5000;

app.get("/", (req, res) => {
  res.send("Backend is running now");
});
app.use("/api", apiVersionMiddleware, otherLimiter, profileRoute);
app.use("/auth", authLimiter, authRoutes);
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
