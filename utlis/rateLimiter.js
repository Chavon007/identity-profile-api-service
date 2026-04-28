import rateLimiter from "express-rate-limit";

export const authLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    status: "error",
    message: "Too many requests. please wait",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otherLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    status: "error",
    message: "Too many requests. hold on",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
