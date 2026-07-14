import jwt, { type SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
if (!ACCESS_SECRET || !REFRESH_SECRET)
  throw new Error("ACCESS_SECRET / REFRESH_SECRET is not set");

const ACCESS_EXPIRY = (process.env.ACCESS_EXPIRY ??
  "15m") as SignOptions["expiresIn"];
const REFRESH_EXPIRY = (process.env.REFRESH_EXPIRY ??
  "7d") as SignOptions["expiresIn"];

export type TokenType = "access" | "refresh";
export interface TokenPayload {
  userId: string;
  type: TokenType;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId, type: "access" }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY,
    algorithm: "HS256",
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, type: "refresh" }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
    algorithm: "HS256",
  });
};

// throws if token is expired
export const verifyAccessToken = (token: string): TokenPayload => {
  const payload = jwt.verify(token, ACCESS_SECRET, {
    algorithms: ["HS256"],
  }) as TokenPayload;
  if (payload.type !== "access") throw new Error("Wrong token type");
  return payload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const payload = jwt.verify(token, REFRESH_SECRET, {
    algorithms: ["HS256"],
  }) as TokenPayload;
  if (payload.type !== "refresh") throw new Error("Wrong token type");
  return payload;
};
