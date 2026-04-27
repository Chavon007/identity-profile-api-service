export const requiredRole = (...roles) => {
  return (req, res, next) => {
    if (req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: insufficient access" });
    }
    next();
  };
};
