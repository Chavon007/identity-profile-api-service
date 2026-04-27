import { verifyToken } from "../utlis/token.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(404)
        .json({ status: "error", message: "User not authenticated" });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
