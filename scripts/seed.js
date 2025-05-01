import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { dbConnect } from "../lib/mongodb.js";
import Admin from "../models/Admin.js";
import School from "../models/School.js";

async function seed() {
  await dbConnect();

  await Admin.deleteMany({});
  await School.deleteMany({});

  const adminPlain = "adminPass123";
  const admin = await Admin.create({
    loginId: "admin1",
    passwordHash: bcrypt.hashSync(adminPlain, 10),
  });
  console.log(
    `✔ Admin created — loginId: ${admin.loginId}, password: ${adminPlain}`,
  );

  const schoolsData = [
    {
      loginId: "school1",
      passwordHash: bcrypt.hashSync("schoolAPass", 10),
      name: "Greenwood Public School",
      district: "North District",
    },
    {
      loginId: "schoolB",
      passwordHash: bcrypt.hashSync("schoolBPass", 10),
      name: "St. Mary’s Academy",
      district: "South District",
    },
  ];
  const inserted = await School.insertMany(schoolsData);
  inserted.forEach((s) =>
    console.log(`✔ School created — loginId: ${s.loginId}, name: ${s.name}`),
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
