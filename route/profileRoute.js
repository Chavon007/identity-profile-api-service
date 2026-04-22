import express from "express";
import {
  createProfile,
  getAllProfile,
  deleteProfile,
  getOneProfile,
  serachProfile,
} from "../controller/profileController.js";

const router = express.Router();

// create a profile
router.post("/profiles", createProfile);
// serach profile with key words
router.get("/profiles/search", serachProfile);
// delete a profile
router.delete("/profiles/:id", deleteProfile);
// get one profile
router.get("/profiles/:id", getOneProfile);
// get all profile
router.get("/profiles", getAllProfile);

export default router;
