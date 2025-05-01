import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { dbConnect } from "../lib/mongodb.js";
import Admin from "../models/Admin.js";

async function seed() {
  await dbConnect();

  const adminPlain = "adminPass123";
  const admin = await Admin.create({
    loginId: "admin1",
    passwordHash: bcrypt.hashSync(adminPlain, 10),
  });
  console.log(
    `✔ Admin created — loginId: ${admin.loginId}, password: ${adminPlain}`,
  );

  await mongoose.connection.close();
}

seed()
  .then(() => {
    console.log("🎉 Seeding complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });
