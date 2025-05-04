import { dbConnect } from "../../../../lib/mongodb.js";
import { verifyToken } from "../../../../lib/auth.js";
import Participation from "../../../../models/Participation.js";

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const schoolId = req.query.pid;

  await dbConnect();
  console.log();

  const rec = await Participation.findOne({ school: schoolId })
    .populate("school", "loginId name district")
    .lean();
  if (!rec) {
    return res.status(200).json({ error: "Not found" });
  }

  // return full record (including sports array)
  return res.status(200).json(rec);
}
