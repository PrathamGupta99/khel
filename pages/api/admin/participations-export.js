// pages/api/admin/participations-export.js
import { dbConnect } from "../../../lib/mongodb.js";
import { verifyToken } from "../../../lib/auth.js";
import School from "../../../models/School.js";
import Participation from "../../../models/Participation.js";
import { utils, write } from "xlsx";

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

  // 4) School lookup
  const schoolFilter = {};
  if (district) schoolFilter.district = district;
  const schools = await School.find(schoolFilter).select(
    "_id loginId name district",
  );
  const schoolIds = schools.map((s) => s._id);

  // 5) Participation lookup mask
  const partFilter = { school: { $in: schoolIds } };
  if (sport || gender || category) {
    partFilter.sports = { $elemMatch: {} };
    if (sport) partFilter.sports.$elemMatch.sport = sport;
    if (gender) partFilter.sports.$elemMatch.gender = gender;
    if (category) partFilter.sports.$elemMatch.category = category;
  }

  // 6) Fetch
  const parts = await Participation.find(partFilter)
    .populate("school", "loginId name district")
    .lean();

  // 7) Filter each doc’s sports array
  const filteredParts = parts.map((p) => ({
    ...p,
    sports: p.sports.filter((entry) => {
      if (sport && entry.sport !== sport) return false;
      if (gender && entry.gender !== gender) return false;
      if (category && entry.category !== category) return false;
      return true;
    }),
  }));

  // 8) Flatten into rows
  const rows = filteredParts.flatMap((p) =>
    p.sports.map((entry) => ({
      LoginID: p.school.loginId,
      SchoolName: p.school.name,
      District: p.school.district,
      Sport: entry.sport,
      Gender: entry.gender,
      Category: entry.category,
      SubmittedAt: p.submittedAt.toISOString(),
    })),
  );

  // 9) Build workbook & send
  const ws = utils.json_to_sheet(rows);
  const wb = { Sheets: { Participations: ws }, SheetNames: ["Participations"] };
  const buf = write(wb, { bookType: "xlsx", type: "buffer" });

  res.setHeader(
    "Content-Disposition",
    'attachment; filename="participations.xlsx"',
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  return res.send(buf);
}
