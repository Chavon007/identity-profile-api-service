import Csrf from "csrf";
const csrf = new Csrf();

export const csrfMiddleware = (req, res, next) => {
  const token = req.headers["x-csrf-token"];
  const secret = req.cookies.csrf_secret;

  if (!token || !secret || !csrf.verify(secret, token)) {
    return res.status(403).json({
      status: "error",
      message: "Invalid CSRF token",
    });
  }
  next();
};