// A user object safe to send back to clients — no hashes, OTP, or tokens.
export interface PublicUserDTO {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string;
  isVerified: number | null;
  isDeleted: number | null;
}
