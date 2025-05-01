// pages/api/auth/forgot-password.js
import { dbConnect } from "../../../lib/mongodb.js";
import School from "../../../models/School.js";
import Admin from "../../../models/Admin.js";
import PasswordReset from "../../../models/PasswordReset.js";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { loginId, isAdmin } = req.body;
  await dbConnect();

  const Model = isAdmin ? Admin : School;
  const user = await Model.findOne({ loginId });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
    await PasswordReset.create({
      userId: user._id,
      kind: isAdmin ? "admin" : "school",
      token,
      expiresAt,
    });

    // TODO: send via email instead of console
    console.log(
      `Reset link: ${process.env.NEXT_PUBLIC_URL}/reset-password?token=${token}&kind=${isAdmin ? "admin" : "school"}`,
    );
  }

  // Always return OK to avoid user-enumeration
  return res.status(200).json({ ok: true });
}
