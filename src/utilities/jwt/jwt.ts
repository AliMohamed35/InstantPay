import jwt from "jsonwebtoken";

const TOKEN_SECRET: string = "secretforfintechapp";
const ACCESS_EXPIRY = "1m";
const REFRESH_EXPIRY = "7d";

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, TOKEN_SECRET, { expiresIn: ACCESS_EXPIRY });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, TOKEN_SECRET, { expiresIn: REFRESH_EXPIRY });
};
