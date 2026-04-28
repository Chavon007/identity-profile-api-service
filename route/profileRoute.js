import express from "express";
import {
  createProfile,
  getAllProfile,
  deleteProfile,
  getOneProfile,
  serachProfile,
} from "../controller/profileController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requiredRole } from "../middleware/requiredRole.js";
const router = express.Router();

// create a profile
router.post("/profiles", authMiddleware, requiredRole("admin"), createProfile);
// serach profile with key words
router.get(
  "/profiles/search",
  authMiddleware,
  requiredRole("admin", "analyst"),
  serachProfile,
);
router.get(
  "/profiles/export",
  authMiddleware,
  requiredRole("admin", "analyst"),
  exportProfiles,
);
// delete a profile
router.delete(
  "/profiles/:id",
  authMiddleware,
  requiredRole("admin"),
  deleteProfile,
);
// get one profile
router.get(
  "/profiles/:id",
  authMiddleware,
  requiredRole("admin", "analyst"),
  getOneProfile,
);
// get all profile
router.get(
  "/profiles",
  authMiddleware,
  requiredRole("admin", "analyst"),
  getAllProfile,
);

export default router;
