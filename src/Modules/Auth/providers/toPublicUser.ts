import type User from "../../../DB/Models/User/User.ts";
import type { PublicUserDTO } from "../dto/PublicUserDTO.ts";

// Whitelist the fields that are safe to expose. Never spread the whole model,
// so that new sensitive columns don't leak by default.
export function toPublicUser(user: User): PublicUserDTO {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    email: user.email,
    isVerified: user.isVerified,
    isDeleted: user.isDeleted,
  };
}
