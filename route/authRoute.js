import express from "express";
import {
  redirectToGitHub,
  handleGithubCallback,
  refreshToken,
  logout,
  getMe,
  getCsrfToken,
} from "../controller/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { csrfMiddleware } from "../middleware/csrfMiddleware.js";

const router = express.Router();

router.get("/github", redirectToGitHub);
router.get("/github/callback", handleGithubCallback);
router.get("/csrf-token", getCsrfToken);
router.get("/me", authMiddleware, getMe);
router.post("/refresh", csrfMiddleware, refreshToken);
router.post("/logout", csrfMiddleware, logout);

export default router;