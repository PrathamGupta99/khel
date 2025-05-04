// pages/api/player-details/index.js
import { dbConnect } from "../../../lib/mongodb.js";
import PlayerDetail from "../../../models/PlayerDetail.js";
import { verifyToken } from "../../../lib/auth.js";

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload || payload.isAdmin) return res.status(401).end();

  await dbConnect();
  if (req.method === "POST") {
    const { sport, gender, category, players, isDraft } = req.body;
    // upsert by participationId + sport/gender/category
    const filter = {
      participation: payload.id,
      sport,
      gender,
      category,
    };
    const update = { players, updatedAt: new Date(), isDraft };
    const opts = { upsert: true, new: true };
    const doc = await PlayerDetail.findOneAndUpdate(filter, update, opts);
    return res.status(200).json(doc);
  } else if (req.method === "GET") {
    const { sport, gender, category } = req.query;
    const docs = await PlayerDetail.find({
      participation: payload.id,
      ...(sport ? { sport } : {}),
      ...(gender ? { gender } : {}),
      ...(category ? { category } : {}),
    });
    return res.status(200).json(docs);
  }
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}
