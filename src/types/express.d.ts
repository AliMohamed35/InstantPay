import type { TokenPayload } from "../utilities/jwt/jwt.ts";

declare global {
    namespace Express{
        interface Request {
            user? : TokenPayload;
        }
    }
}

export {};