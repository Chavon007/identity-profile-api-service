import express from "express";
import {
  redirectToGitHub,
  handleGithubCallback,
  refreshToken,
  logout,
} from "../controller/authController.js";
const router = express.Router();

router.get("/github", redirectToGitHub);
router.get("/github/callback", handleGithubCallback);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
