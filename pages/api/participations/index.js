// pages/api/participations/index.js
import { dbConnect } from "../../../lib/mongodb.js";
import Participation from "../../../models/Participation.js";
import School from "../../../models/School.js";
import { verifyToken } from "../../../lib/auth.js";

export default async function handler(req, res) {
  const auth = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(auth);
  if (!payload || payload.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const schoolId = payload.id;

  await dbConnect();

  if (req.method === "GET") {
    const record = await Participation.findOne({ school: schoolId }).lean();
    return res.status(200).json(record || {});
  }

  if (req.method === "POST") {
    const { name, district, sports } = req.body;

    // 1) Validate
    if (!name || !district) {
      return res.status(400).json({ error: "Name and district are required" });
    }
    if (!Array.isArray(sports) || sports.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one sport must be selected" });
    }

    // 2) Update school info
    await School.findByIdAndUpdate(schoolId, { name, district });

    let record = await Participation.findOne({ school: schoolId });
    if (record) {
      record.sports = sports;
      record.submittedAt = Date.now();
      await record.save();
      return res.status(200).json(record);
    } else {
      record = await Participation.create({ school: schoolId, sports });
      return res.status(201).json(record);
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
