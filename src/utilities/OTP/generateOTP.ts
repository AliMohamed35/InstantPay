import { randomInt } from "node:crypto";

export function generateOTP(ttlMs = 15 * 60 * 1000) {
  const otp = String(randomInt(100000, 1000000));
  const otpExpire = new Date(Date.now() + ttlMs); // 15 minutes
  return { otp, otpExpire };
}
