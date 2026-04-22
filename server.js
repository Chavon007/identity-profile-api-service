import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./config/dataabase.js";
import profileRoute from "./route/profileRoute.js";
dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());
const PORT = 5000;

app.get("/", (req, res) => {
  res.send("Backend is running now");
});
app.use("/api", profileRoute);
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
