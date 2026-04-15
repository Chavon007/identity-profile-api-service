import profileModel from "../model/profileModel.js";
import { getProfile } from "../service/profileService.js";
import { v7 as uuidv7 } from "uuid";

// Create profile
export const createProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ status: "error", message: "Name can not be empty" });
    }
    if (typeof name !== "string" || name.trim() === "") {
      return res
        .status(422)
        .json({ status: "error", message: "Name must be a string" });
    }
    const checkExistingName = await profileModel.findOne({ name });
    if (checkExistingName) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: checkExistingName,
      });
    }

    const mainProfile = await getProfile(name);

    if (mainProfile.age === null) {
      return res.status(502).json({
        status: "error",
        message: "Agify returned an invalid response",
      });
    }
    if (mainProfile.gender === null || mainProfile.count === 0) {
      return res
        .status(502)
        .json({ status: "error", message: "Gender can't be null or 0" });
    }
    if (!mainProfile.country || mainProfile.country.length === 0) {
      return res.status(502).json({
        status: "error",
        message: "Nationalize returned an invalid response",
      });
    }

    let age_group;
    if (mainProfile.age <= 12) {
      age_group = "child";
    } else if (mainProfile.age <= 19) {
      age_group = "teenage";
    } else if (mainProfile.age <= 59) {
      age_group = "adult";
    } else {
      age_group = "senior";
    }

    const countries = mainProfile.country;
    if (countries.length === 0) {
      return "unknown";
    }

    const topCountries = countries.reduce((max, current) =>
      current.probability > max.probability ? current : max,
    );
    const newProfile = await profileModel.create({
      id: uuidv7(),
      name: name.toLowerCase(),
      gender: mainProfile.gender,
      gender_probability: mainProfile.probability,
      sample_size: mainProfile.count,
      age: mainProfile.age,
      age_group: age_group,
      country_id: topCountries.country_id,
      country_probability: topCountries.probability,
      created_at: new Date().toISOString(),
    });

    res.status(201).json({
      status: "success",
      message: "Profile created successfully",
      data: newProfile,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Get all profile
export const getAllProfile = async (req, res) => {
  try {
    const { gender, country_id, age_group } = req.query;

    const query = {};

    if (gender) {
      query.gender = gender.toLowerCase();
    }
    if (country_id) {
      query.country_id = country_id.toUpperCase();
    }
    if (age_group) {
      query.age_group = age_group.toLowerCase();
    }

    const getProfile = await profileModel.find(query);

    const formatted = getProfile.map((profile) => ({
      id: profile.id,
      name: profile.name,
      gender: profile.gender,
      age: profile.age,
      age_group: profile.age_group,
      country_id: profile.country_id,
    }));

    res
      .status(200)
      .json({ status: "success", count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Get one profile
export const getOneProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await profileModel.findById(id);
    if (!profile) {
      return res
        .status(404)
        .json({ status: "error", message: "Profile not found" });
    }
    res.status(200).json({ status: "success", data: profile });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Delete a profile
export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const remove = await profileModel.findByIdAndDelete(id);
    if (!remove) {
      res.status(404).json({ status: "error", message: "No profile found" });
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
