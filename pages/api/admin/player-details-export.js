import { dbConnect } from "../../../lib/mongodb.js";
import { verifyToken } from "../../../lib/auth.js";
import PlayerDetail from "../../../models/PlayerDetail.js";
import { utils, write } from "xlsx";
import Participation from "../../../models/Participation.js";

export default async function handler(req, res) {
  // Only GET allowed
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Auth: must be admin
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Connect to DB
  await dbConnect();

  // Read query parameters
  const { participationId, sport, gender, category } = req.query;
  if (!participationId) {
    return res.status(400).json({ error: "participationId is required" });
  }

  // Build filter
  const filter = { participation: participationId };
  if (sport) filter.sport = sport;
  if (gender) filter.gender = gender;
  if (category) filter.category = category;

  // Fetch matching PlayerDetail docs
  const docs = await PlayerDetail.find(filter).lean();

  const [participation] = await Participation.find({ school: participationId })
    .populate("school", "name")
    .lean();

  const schoolName = participation?.school?.name || "";

  if (!docs.length) {
    return res.status(404).json({ error: "No player details found" });
  }

  // Flatten into rows
  const rows = docs.flatMap((doc) =>
    doc.players.map((p) => ({
      School: schoolName,
      Sport: doc.sport,
      Gender: doc.gender,
      Category: doc.category,
      Name: p.name,
      FatherName: p.fatherName,
      Class: p.std,
      DOB: new Date(p.dob).toLocaleDateString(),
      RegNo: p.regNo,
    })),
  );

  // Create workbook
  const ws = utils.json_to_sheet(rows);
  const wb = { Sheets: { Players: ws }, SheetNames: ["Players"] };
  const buf = write(wb, { bookType: "xlsx", type: "buffer" });

  // Send as attachment
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="player-details.xlsx"',
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  return res.send(buf);
}
