import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    required: true,
  },
  gender_probability: {
    type: Number,
    required: true,
  },
  sample_size: {
    type: Number,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  country_id: {
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
    type: Date,
    default: new Date(),
  },
});

export default mongoose.model("Profile", profileSchema);
