import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  github_id: {
    type: String,
    required: true,
  },

  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatar_url: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["analyst", "admin"],
    default: "analyst",
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  last_login_at: {
    type: Date,
  },
  created_at: {
    type: Date,
    default: () => new Date().toISOString(),
  },
});

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
