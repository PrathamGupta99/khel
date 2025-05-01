// models/School.js
import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema({
  loginId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  district: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Avoid recompiling model during hot-reload
export default mongoose.models.School || mongoose.model("School", SchoolSchema);
