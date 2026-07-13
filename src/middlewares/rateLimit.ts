import rateLimit from "express-rate-limit";

const base = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: " Too many attempts, try again later!" },
};

export const authLimiter = rateLimit({ ...base, max: 10 });
export const otpLimiter = rateLimit({ ...base, max: 5 });
