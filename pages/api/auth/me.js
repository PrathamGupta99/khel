// pages/api/auth/me.js
import { dbConnect } from "../../../lib/mongodb.js";
import School from "../../../models/School.js";
import Admin from "../../../models/Admin.js";
import { verifyToken } from "../../../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const auth = req.headers.authorization?.split(" ")[1];
  if (!auth) return res.status(401).json({ error: "Missing token" });

  const payload = verifyToken(auth);
  if (!payload)
    return res.status(401).json({ error: "Invalid or expired token" });

  await dbConnect();
  if (payload.isAdmin) {
    const admin = await Admin.findById(payload.id).select("-passwordHash");
    if (!admin) return res.status(404).json({ error: "Not found" });
    return res
      .status(200)
      .json({ user: { loginId: admin.loginId, isAdmin: true } });
  } else {
    const school = await School.findById(payload.id).select("-passwordHash");
    if (!school) return res.status(404).json({ error: "Not found" });
    const { loginId, name, district, isAdmin } = school;
    return res.status(200).json({ user: { loginId, name, district, isAdmin } });
  }
}
