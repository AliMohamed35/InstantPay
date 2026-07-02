import jwt from "jsonwebtoken";

const TOKEN_SECRET: string = "secretforfintechapp";
const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

export interface TokenPayload{
  userId: string;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, TOKEN_SECRET, { expiresIn: ACCESS_EXPIRY });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, TOKEN_SECRET, { expiresIn: REFRESH_EXPIRY });
};

// throws if token is expired
export const verifyToken = (token: string): TokenPayload =>{
  return jwt.verify(token, TOKEN_SECRET) as TokenPayload;
}
