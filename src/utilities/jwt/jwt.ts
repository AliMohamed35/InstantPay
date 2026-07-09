import jwt, { type SignOptions } from "jsonwebtoken";

const TOKEN_SECRET = process.env.TOKEN_SECRET;
if (!TOKEN_SECRET) throw new Error("TOKEN_SECRET is not set");
const ACCESS_EXPIRY = (process.env.ACCESS_EXPIRY ?? "15m") as SignOptions["expiresIn"];
const REFRESH_EXPIRY = (process.env.REFRESH_EXPIRY ?? "7d") as SignOptions["expiresIn"];

export interface TokenPayload {
  userId: string;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, TOKEN_SECRET, { expiresIn: ACCESS_EXPIRY });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, TOKEN_SECRET, { expiresIn: REFRESH_EXPIRY });
};

// throws if token is expired
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, TOKEN_SECRET) as TokenPayload;
};
