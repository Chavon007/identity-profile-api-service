import express from "express";
import {
  createProfile,
  getAllProfile,
  deleteProfile,
  getOneProfile,
} from "../controller/profileController.js";

const router = express.Router();

// create a profile
router.post("/profiles", createProfile);
// delete a profile
router.delete("/profiles/:id", deleteProfile);
// get one profile
router.get("/profiles/:id", getOneProfile);
// get all profile
router.get("/profiles", getAllProfile);
export default router;
