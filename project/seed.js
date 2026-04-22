import "dotenv/config";
import { v7 as uuidv7 } from "uuid";
import fs from "fs";
import profileModel from "../model/profileModel.js";
import { connectDb } from "../config/dataabase.js";

await connectDb();

const profiles = JSON.parse(fs.readFileSync("./profiles.json", "utf-8"));

for (const profile of profiles) {
  const exists = await profileModel.findOne({ name: profile.name });

  if (exists) continue;

  await profileModel.create({
    name: profile.name,
    gender: profile.gender,
    gender_probability: profile.gender_probability,
    id: profile.id || uuidv7(),
    sample_size: profile.sample_size,
    age: profile.age,
    country_id: profile.country_id,
    country_name: profile.country_name,
    country_probability: profile.country_probability,
    age_group: profile.age_group,
  });
}

console.log("Seeding completed");
process.exit();
