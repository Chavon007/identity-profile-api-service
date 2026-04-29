import profileModel from "../model/profileModel.js";
import { getProfile } from "../service/profileService.js";
import { v7 as uuidv7 } from "uuid";
import { parseSearch } from "../service/searchparse.js";
import { parse } from "json2csv";
// Create profile
export const createProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (name === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Missing name",
      });
    }

    if (typeof name !== "string") {
      return res.status(422).json({
        status: "error",
        message: "Invalid type",
      });
    }

    if (name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Name can not be empty",
      });
    }
    const checkExistingName = await profileModel.findOne({
      name: name.trim().toLowerCase(),
    });
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
      return res.status(502).json({
        status: "error",
        message: "Genderize returned an invalid response",
      });
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
      age_group = "teenager";
    } else if (mainProfile.age <= 59) {
      age_group = "adult";
    } else {
      age_group = "senior";
    }

    const countries = mainProfile.country;

    const topCountries = countries.reduce((max, current) =>
      current.probability > max.probability ? current : max,
    );
    const newProfile = await profileModel.create({
      id: uuidv7(),
      name: name.trim().toLowerCase(),
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
      data: newProfile,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Get all profile
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

    if (gender) {
      query.gender = gender.toLowerCase();
    }
    if (country_id) {
      query.country_id = country_id.toUpperCase();
    }
    if (age_group) {
      query.age_group = age_group.toLowerCase();
    }

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

    // sorting
    const allowedSortFields = ["age", "created_at", "gender_probability"];
    const sortedFields = allowedSortFields.includes(sort_by)
      ? sort_by
      : "created_at";

    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj = { [sortedFields]: sortOrder };

    // pagination
    const pageNum = Math.max(1, Number(page)));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skips = (pageNum - 1) * limitNum;

    const total = await profileModel.countDocuments(query);

    const profiles = await profileModel
      .find(query)
      .sort(sortObj)
      .skip(skips)
      .limit(limitNum);

    const formatted = profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      gender: profile.gender,
      gender_probability: profile.gender_probability,
      age: profile.age,
      age_group: profile.age_group,
      country_id: profile.country_id,
      country_name: profile.country_name,
      country_probability: profile.country_probability,
      created_at: profile.created_at,
    }));

    const totalPages = Math.ceil(total / limitNum);
    const baseUrl = `/api/profiles`;
    const buildUrl = (p) => `${baseUrl}?page=${p}&limit=${limitNum}`;

    res.status(200).json({
      status: "success",
      page: pageNum,
      limit: limitNum,
      total,
      total_pages: totalPages,
      link: {
        self: buildUrl(pageNum),
        next: pageNum < totalPages ? buildUrl(pageNum + 1) : null,
        prev: pageNum > 1 ? buildUrl(pageNum - 1) : null,
      },
      data: formatted,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const exportProfiles = async (req, res) => {
  try {
    const { gender, country_id, age_group, min_age, max_age } = req.query;

    const query = {};
    if (gender) query.gender = gender.toLowerCase();
    if (country_id) query.country_id = country_id.toUpperCase();
    if (age_group) query.age_group = age_group.toLowerCase();
    if (min_age || max_age) {
      query.age = {};
      if (min_age) query.age.$gte = Number(min_age);
      if (max_age) query.age.$lte = Number(max_age);
    }

    const profiles = await profileModel.find(query);

    const fields = [
      "id",
      "name",
      "gender",
      "gender_probability",
      "age",
      "age_group",
      "country_id",
      "country_name",
      "country_probability",
      "created_at",
    ];

    const csv = parse(
      profiles.map((p) => ({
        id: p.id,
        name: p.name,
        gender: p.gender,
        gender_probability: p.gender_probability,
        age: p.age,
        age_group: p.age_group,
        country_id: p.country_id,
        country_name: p.country_name,
        country_probability: p.country_probability,
        created_at: p.created_at,
      })),
      { fields },
    );

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="profiles_${timestamp}.csv"`,
    );

    return res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
// Get one profile
export const getOneProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await profileModel.findOne({ id });
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

    const remove = await profileModel.findOneAndDelete({ id });
    if (!remove) {
      return res
        .status(404)
        .json({ status: "error", message: "Profile not found" });
    }

    return res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const serachProfile = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim() === "") {
      return res
        .status(400)
        .json({ status: "error", message: "Missing or empty parameter" });
    }

    const filter = parseSearch(q);

    if (!filter) {
      return res
        .status(200)
        .json({ status: "error", message: "Unable to interpret query" });
    }
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skips = (pageNum - 1) * limitNum;

    const total = await profileModel.countDocuments(filter);
    const getProfile = await profileModel
      .find(filter)
      .skip(skips)
      .limit(limitNum);

    const formatted = getProfile.map((profile) => ({
      id: profile.id,
      name: profile.name,
      gender: profile.gender,
      gender_probability: profile.gender_probability,
      age: profile.age,
      age_group: profile.age_group,
      country_id: profile.country_id,
      country_name: profile.country_name,
      country_probability: profile.country_probability,
      created_at: profile.created_at,
    }));

    res.status(200).json({
      status: "success",
      page: pageNum,
      limit: limitNum,
      data: formatted,
      total,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
