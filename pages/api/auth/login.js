// pages/api/auth/login.js
import { dbConnect } from "../../../lib/mongodb.js";
import School from "../../../models/School.js";
import Admin from "../../../models/Admin.js";
import { signToken } from "../../../lib/auth.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { loginId, password, isAdmin } = req.body;
  await dbConnect();

  const Model = isAdmin ? Admin : School;
  const user = await Model.findOne({ loginId });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({ id: user._id, isAdmin: !!isAdmin });
  return res.status(200).json({ token });
}
