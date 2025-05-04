// models/PlayerDetail.js
import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    std: {
      type: String,
      required: true,
      enum: ["6", "7", "8", "9", "10", "11", "12"],
    },
    dob: {
      type: Date,
      required: true,
    },
    regNo: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const PlayerDetailSchema = new mongoose.Schema({
  participation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participation",
    required: true,
    index: true,
  },
  sport: {
    type: String,
    required: true,
    enum: ["Kho-Kho", "Kabaddi", "Chess", "Volleyball", "Badminton"],
  },
  gender: {
    type: String,
    required: true,
    enum: ["Boys", "Girls"],
  },
  category: {
    type: String,
    required: true,
    enum: ["U-14", "U-17", "U-19"],
  },
  players: {
    type: [PlayerSchema],
    default: [],
  },
  isDraft: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one document per participation + sport+gender+category
PlayerDetailSchema.index(
  { participation: 1, sport: 1, gender: 1, category: 1 },
  { unique: true },
);

export default mongoose.models.PlayerDetail ||
  mongoose.model("PlayerDetail", PlayerDetailSchema);
