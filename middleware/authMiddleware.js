import { verifyToken } from "../utlis/token.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "User not authenticated" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid or expired token" });
    }

    if (!decoded.is_active) {
      return res
        .status(403)
        .json({ status: "error", message: "Account is deactivated" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
