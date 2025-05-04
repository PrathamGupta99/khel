// seed_school.js

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { schoolData } from "./data.js";

import { dbConnect } from "../lib/mongodb.js";
import School from "../models/School.js";

async function seedSchools() {
  // 1. Connect
  await dbConnect();

  // 2. Wipe existing
  await School.deleteMany({});
  console.log("🗑️  Cleared existing School collection");

  // 3. Helpers for loginId generation
  const slugDistrict = (name) =>
    name.trim().replace(/\s+/g, "").slice(0, 5).toUpperCase();

  let passwordCounter = 1;
  const makeLoginId = (district, serial) => {
    const prefix = district
      .trim()
      .replace(/\s+/g, "")
      .substring(0, 5)
      .toUpperCase();
    return `${prefix}-${serial}`;
  };

  const makePlainPassword = (district, serial, counter) => {
    const prefix = slugDistrict(district);
    const serialStr = String(serial).replace(".", "");
    return `${prefix}${serialStr}-${counter}`;
  };
  console.log(schoolData);
  // 4. Build school docs
  const docs = schoolData.map((r) => {
    const loginId = makeLoginId(r.District, r.Serial);
    const plainPassword = makePlainPassword(
      r.District,
      r.Serial,
      passwordCounter++,
    );

    console.log(plainPassword);
    // console.log(plainPassword)
    return {
      loginId,
      passwordHash: bcrypt.hashSync(plainPassword, 10),
      name: r["School Name & Address"],
      district: r.District,
      isAdmin: false,
      _plainPassword: plainPassword, // for logging
    };
  });

  // 5. Insert into DB
  const inserted = await School.insertMany(
    docs.map(({ _plainPassword, ...doc }) => doc),
  );

  // 6. Log results
  inserted.forEach((s, idx) => {
    console.log(
      `✔ ${s.loginId} | pwd: ${docs[idx]._plainPassword} — ${s.name}`,
    );
  });

  // 7. Done
  await mongoose.connection.close();
  console.log("🎉 All schools seeded!");
}

seedSchools().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
