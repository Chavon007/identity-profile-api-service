import profileModel from "../model/profileModel.js";
import { getProfile } from "../service/profileService.js";
import { v7 as uuidv7 } from "uuid";
import { parseSearch } from "../service/searchparse.js";
import { parse } from "json2csv";

// CREATE PROFILE
export const createProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Missing name",
      });
    }

    const mainProfile = await getProfile(name);

    if (!mainProfile) {
      return res.status(502).json({
        status: "error",
        message: "External API failed",
      });
    }

    let age_group;
    if (mainProfile.age <= 12) age_group = "child";
    else if (mainProfile.age <= 19) age_group = "teenager";
    else if (mainProfile.age <= 59) age_group = "adult";
    else age_group = "senior";

    const topCountries = mainProfile.country.reduce((max, current) =>
      current.probability > max.probability ? current : max
    );

    const newProfile = await profileModel.create({
      id: uuidv7(),
      name: name.trim().toLowerCase(),
      gender: mainProfile.gender,
      gender_probability: mainProfile.probability,
      sample_size: mainProfile.count,
      age: mainProfile.age,
      age_group,
      country_id: topCountries.country_id,
      country_probability: topCountries.probability,
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      status: "success",
      data: newProfile,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// GET ALL PROFILES
export const getAllProfile = async (req, res) => {
  try {
    const {
      gender,
      country_id,
      age_group,
      min_age,
      max_age,
      sort_by,
      order,
      probability,
      min_country_probability,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (gender) query.gender = gender.toLowerCase();
    if (country_id) query.country_id = country_id.toUpperCase();
    if (age_group) query.age_group = age_group.toLowerCase();

    if (min_age || max_age) {
      query.age = {};
      if (min_age) query.age.$gte = Number(min_age);
      if (max_age) query.age.$lte = Number(max_age);
    }

    if (probability) {
      query.gender_probability = { $gte: Number(probability) };
    }

    if (min_country_probability) {
      query.country_probability = { $gte: Number(min_country_probability) };
    }

    const allowedSortFields = ["age", "created_at", "gender_probability"];
    const sortedFields = allowedSortFields.includes(sort_by)
      ? sort_by
      : "created_at";

    const sortOrder = order === "asc" ? 1 : -1;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const total = await profileModel.countDocuments(query);

    const profiles = await profileModel
      .find(query)
      .sort({ [sortedFields]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      status: "success",
      page: pageNum,
      limit: limitNum,
      total,
      total_pages: totalPages,
      data: profiles,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// EXPORT PROFILES (CSV)
export const exportProfiles = async (req, res) => {
  try {
    const profiles = await profileModel.find();

    const csv = parse(profiles);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="profiles_${timestamp}.csv"`
    );

    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// GET ONE PROFILE
export const getOneProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await profileModel.findOne({ id });

    if (!profile) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: profile,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// DELETE PROFILE
export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await profileModel.findOneAndDelete({ id });

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found",
      });
    }

    return res.sendStatus(204);
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// SEARCH PROFILE
export const serachProfile = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Missing query",
      });
    }

    const filter = parseSearch(q);

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const total = await profileModel.countDocuments(filter);

    const profiles = await profileModel
      .find(filter)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      status: "success",
      page: pageNum,
      limit: limitNum,
      total,
      data: profiles,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};