import express from "express";
import { redirectToGitHub } from "../controller/authController.js";
const router = express.Router();

router.get("/github", redirectToGitHub);

export default router;
