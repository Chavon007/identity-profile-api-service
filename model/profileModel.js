import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  gender: {
    type: String,
    required: true,
  },
  gender_probability: {
    type: Number,
    required: true,
  },
  id: {
    type: String,
    required: false,
    unique: true,
  },
  sample_size: {
    type: Number,
    required: false,
  },
  age: {
    type: Number,
    required: true,
  },
  country_id: {
    type: String,
    required: true,
  },
  country_name: {
    type: String,
    required: true,
  },
  country_probability: {
    type: Number,
    required: true,
  },
  age_group: {
    type: String,
    required: true,
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

profileSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
export default mongoose.model("Profile", profileSchema);
