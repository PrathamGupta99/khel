// pages/api/admin/participations.js
import { dbConnect } from "../../../lib/mongodb.js";
import { verifyToken } from "../../../lib/auth.js";
import School from "../../../models/School.js";
import Participation from "../../../models/Participation.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1) Auth
  const authHeader = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(authHeader);
  if (!payload?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 2) Connect
  await dbConnect();

  // 3) Read filters
  const { district, sport, gender, category } = req.query;

  // 4) Find matching schools
  const schoolFilter = {};
  if (district) schoolFilter.district = district;
  const schools = await School.find(schoolFilter).select(
    "_id loginId name district",
  );
  const schoolIds = schools.map((s) => s._id);

  // 5) Initial participation filter (returns docs containing at least one matching entry)
  const partFilter = { school: { $in: schoolIds } };
  if (sport || gender || category) {
    partFilter.sports = { $elemMatch: {} };
    if (sport) partFilter.sports.$elemMatch.sport = sport;
    if (gender) partFilter.sports.$elemMatch.gender = gender;
    if (category) partFilter.sports.$elemMatch.category = category;
  }

  // 6) Query all matching docs
  const parts = await Participation.find(partFilter)
    .populate("school", "loginId name district")
    .lean();

  // 7) For each doc, filter its sports array down to only the entries matching ALL provided filters
  const filtered = parts.map((p) => {
    const filteredSports = p.sports.filter((entry) => {
      if (sport && entry.sport !== sport) return false;
      if (gender && entry.gender !== gender) return false;
      if (category && entry.category !== category) return false;
      return true;
    });
    return {
      school: p.school,
      sports: filteredSports,
      submittedAt: p.submittedAt,
    };
  });

  // 8) Return
  return res.status(200).json(filtered);
}
