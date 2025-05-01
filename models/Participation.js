// models/Participation.js
import mongoose from "mongoose";

const SportEntrySchema = new mongoose.Schema(
  {
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
  },
  { _id: false },
);

const ParticipationSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  sports: {
    type: [SportEntrySchema],
    validate: (v) => Array.isArray(v) && v.length > 0,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Participation ||
  mongoose.model("Participation", ParticipationSchema);
