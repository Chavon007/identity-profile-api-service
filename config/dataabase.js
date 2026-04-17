let isConnected = false;

export const connectDb = async () => {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI);

  isConnected = true;
  console.log("Database connected successfully");
};