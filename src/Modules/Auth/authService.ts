import {
  BadRequestException,
  UserAlreadyActiveException,
  UserAlreadyExistException,
  UserNotFoundException,
} from "../../Exceptions/CustomExceptions/Exceptions.ts";
import {
  comparePassword,
  compareRefresh,
  hashPassword,
  hashRefresh,
} from "../../utilities/bcrypt/bcrypt.ts";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  type TokenPayload,
} from "../../utilities/jwt/jwt.ts";
import { generateOTP } from "../../utilities/OTP/generateOTP.ts";
import { authRepository } from "./authRepository.ts";
import type { LoginDTO } from "./dto/LoginDTO.ts";
import type { RegisterDTO, RegisterResponseDTO } from "./dto/RegisterDTO.ts";
import { checkExistence } from "./providers/checkExistence.ts";
import { toPublicUser } from "./providers/toPublicUser.ts";

class AuthService {
  // We need to add send OTP and resend OTP
  public async register(userData: RegisterDTO): Promise<RegisterResponseDTO> {
    // check user existence
    const userExist = await checkExistence(userData.email);

    if (!userExist) {
      const hashedPassword = await hashPassword(userData.password);
      const hashedPin = await hashPassword(userData.pin);
      const { otp, otpExpire } = generateOTP();

      await authRepository.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        passwordHash: hashedPassword,
        isActive: 0,
        isVerified: 0,
        OTP: otp,
        otpExpire,
        pinHash: hashedPin,
      });

      return {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
      };
    } else {
      throw new UserAlreadyExistException("User already exist, please login!");
    }
  }

  // Login
  public async login(loginData: LoginDTO) {
    // check existence
    const userExist = await checkExistence(loginData.email);

    if (!userExist) {
      throw new BadRequestException("user doesn't exist!");
    }

    if (!userExist?.isVerified) {
      throw new BadRequestException("User not verified!");
    }

    const matchedPassword = await comparePassword(
      loginData.password,
      userExist.passwordHash,
    );

    if (!matchedPassword) {
      throw new BadRequestException("Invalid login credentials!");
    }

    if (userExist.isActive) {
      throw new UserAlreadyActiveException("Already logged in!");
    }

    const accessToken = generateAccessToken(userExist.userId);
    const refreshToken = generateRefreshToken(userExist.userId);

    const hashedRefresh = await hashRefresh(refreshToken);

    await authRepository.update(
      { isActive: 1, refreshToken: hashedRefresh, isDeleted: 0 },
      { where: { email: userExist.email } },
    );

    return { userId: userExist.userId, accessToken, refreshToken };
  }

  //logout
  public async logout(userId: any) {
    // findUserById
    const userExist = await authRepository.findById(userId);

    if (!userExist) {
      throw new UserNotFoundException("User not found!");
    }

    if (userExist.isActive == 0) {
      throw new BadRequestException("User Already logged out!");
    }

    await authRepository.update(
      { isActive: 0, refreshToken: null },
      { where: { email: userExist.email } },
    );

    return { userId: userExist.userId };
  }

  // verifyOTP
  public async verifyOTP(email: string, otp: any) {
    const userExist = await checkExistence(email);

    if (!userExist) {
      throw new UserNotFoundException("User not found!");
    }

    if (userExist?.otpExpire! < Date.now()) {
      throw new BadRequestException("OTP expired, resend a new one!");
    }

    if (userExist.OTP !== otp) {
      throw new BadRequestException("OTP doesn't match!");
    }

    await authRepository.update(
      { isVerified: 1, OTP: null, otpExpire: null },
      { where: { email } },
    );

    return toPublicUser(userExist);
  }

  // ResendOTP
  public async resendOTP(email: string) {
    const userExist = await checkExistence(email);

    if (!userExist) {
      throw new UserNotFoundException("User not found!");
    }

    if (userExist.isVerified) {
      throw new BadRequestException("User already verified!");
    }

    const { otp, otpExpire } = generateOTP();

    return await authRepository.update(
      { OTP: otp, otpExpire },
      { where: { email } },
    );
  }

  // Reset / forget password
  // check email existence
  // send email or sms to user phoneNumber
  // then update the password in database with the new one

  // refreshToken
  public async refreshToken(refreshToken: string) {
    // 1. verify signature
    let payload: TokenPayload;

    try {
      payload = verifyToken(refreshToken);
    } catch (error) {
      throw new BadRequestException("Invalid or expired refresh token!");
    }

    const user = await authRepository.findById(payload.userId);

    const matches = user?.refreshToken
      ? await compareRefresh(refreshToken, user.refreshToken)
      : false;

    if (
      !user ||
      !user.refreshToken ||
      user.refreshToken !== refreshToken ||
      !matches
    ) {
      if (user) {
        await authRepository.update(
          { refreshToken: null },
          { where: { userId: user.userId } },
        );
      }
      throw new BadRequestException("Invalid refresh token!");
    }

    const accessToken = generateAccessToken(user.userId);
    const newRefreshToken = generateRefreshToken(user.userId);

    await authRepository.update(
      { refreshToken: await hashRefresh(newRefreshToken) },
      { where: { userId: user.userId } },
    );

    return { accessToken, refreshToken: newRefreshToken };
  }
}

export const authService = new AuthService();
