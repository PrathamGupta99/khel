// pages/api/auth/reset-password.js
import { dbConnect } from "../../../lib/mongodb.js";
import School from "../../../models/School.js";
import Admin from "../../../models/Admin.js";
import PasswordReset from "../../../models/PasswordReset.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { token, newPassword, kind } = req.body;
  await dbConnect();

  const pr = await PasswordReset.findOne({
    token,
    kind,
    expiresAt: { $gt: new Date() },
  });
  if (!pr) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  const Model = kind === "admin" ? Admin : School;
  const hash = await bcrypt.hash(newPassword, 10);
  await Model.findByIdAndUpdate(pr.userId, { passwordHash: hash });
  await pr.deleteOne();

  return res.status(200).json({ ok: true });
}
