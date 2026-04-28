import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  user_id: {
    type: String,
    ref: "User",
    required: true,
  },
  token_hashed: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Date,
    default: () => new Date().toISOString(),
  },
  created_at: {
    type: Date,
    default: () => new Date().toISOString(),
  },
});

export default mongoose.model("refreshtoken", refreshTokenSchema);
