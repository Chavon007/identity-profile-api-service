import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./config/dataabase.js";
import profileRoute from "./route/profileRoute.js";
dotenv.config();
const app = express();

connectDb();
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
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
