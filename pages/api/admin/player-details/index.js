// pages/api/admin/player-details/index.js

import { dbConnect } from "../../../../lib/mongodb.js";
import { verifyToken } from "../../../../lib/auth.js";
import PlayerDetail from "../../../../models/PlayerDetail.js";

export default async function handler(req, res) {
  // only GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // auth + admin check
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // connect
  await dbConnect();

  // build filter from query
  const { participationId, sport, gender, category } = req.query;
  const filter = { participation: participationId, isDraft: false };
  if (sport) filter.sport = sport;
  if (gender) filter.gender = gender;
  if (category) filter.category = category;

  // fetch matching docs
  const docs = await PlayerDetail.find(filter).lean();

  // if none found, 404
  if (!docs.length) {
    return res.status(200).json({ error: "No player-details found" });
  }

  // return array of matching docs
  return res.status(200).json(docs);
}
