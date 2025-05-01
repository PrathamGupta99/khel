// models/PasswordReset.js
import mongoose from "mongoose";

const PasswordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  kind: {
    type: String,
    required: true,
    enum: ["school", "admin"],
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ensure TTL index so expired docs auto-remove
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PasswordReset ||
  mongoose.model("PasswordReset", PasswordResetSchema);
