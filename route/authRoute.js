import express from "express";
import {
  redirectToGitHub,
  handleGithubCallback,
  refreshToken,
  logout,
  getMe,
} from "../controller/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/github", redirectToGitHub);
router.get("/github/callback", handleGithubCallback);
router.post("/refresh", refreshToken);
router.get("/me", authMiddleware, getMe);
router.post("/logout", logout);

export default router;
