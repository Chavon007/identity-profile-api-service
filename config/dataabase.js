import mongoose from "mongoose";



export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    console.log(" Database connected successfully");
  } catch (err) {
    console.error(" DB connection error:", err);

    process.exit(1);
  }
};
