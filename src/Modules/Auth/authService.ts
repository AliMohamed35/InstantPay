import {
  BadRequestException,
  UserAlreadyExistException,
  UserNotFoundException,
} from "../../Exceptions/CustomExceptions/Exceptions.ts";
import * as bcryptContent from "../../utilities/bcrypt/bcrypt.ts";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
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
      const hashedPassword = await bcryptContent.hashPassword(
        userData.password,
      );
      const hashedPin = await bcryptContent.hashPassword(userData.pin);
      const { otp, otpExpire } = generateOTP();

      await authRepository.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        passwordHash: hashedPassword,
        isVerified: 0,
        otpHash: await bcryptContent.hashPassword(otp),
        otpExpire,
        otpAttempts: 0,
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
    const invalid = () => new BadRequestException("Invalid email or password");

    if (!userExist) throw invalid();

    const matchedPassword = await bcryptContent.comparePassword(
      loginData.password,
      userExist.passwordHash,
    );

    if (!matchedPassword) throw invalid();

    if (!userExist?.isVerified) {
      throw new BadRequestException("Please verify your account first!");
    }

    const accessToken = generateAccessToken(userExist.userId);
    const refreshToken = generateRefreshToken(userExist.userId);

    const hashedRefresh = await bcryptContent.hashRefresh(refreshToken);

    await authRepository.update(
      { refreshToken: hashedRefresh, isDeleted: 0 },
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

    await authRepository.update(
      { refreshToken: null },
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

    if (!userExist.otpHash || !userExist.otpExpire) {
      throw new BadRequestException("No OTP pending, request a new one");
    }

    if (userExist.otpExpire < new Date()) {
      throw new BadRequestException("OTP expired, resend a new one!");
    }

    if (userExist.otpAttempts >= 5)
      throw new BadRequestException("Too many attempts, request a new OTP");

    const ok = await bcryptContent.comparePassword(
      String(otp),
      userExist.otpHash,
    );

    if (!ok) {
      await authRepository.update(
        { otpAttempts: userExist.otpAttempts + 1 },
        { where: { email } },
      );
      throw new BadRequestException("OTP doesn't match!");
    }

    await authRepository.update(
      { isVerified: 1, otpHash: null, otpExpire: null, otpAttempts: 0 },
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
      {
        otpHash: await bcryptContent.hashPassword(otp),
        otpExpire,
        otpAttempts: 0,
      },
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
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new BadRequestException("Invalid or expired refresh token!");
    }

    const user = await authRepository.findById(payload.userId);

    const matches = user?.refreshToken
      ? await bcryptContent.compareRefresh(refreshToken, user.refreshToken)
      : false;

    if (!user || !user.refreshToken || !matches) {
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
      { refreshToken: await bcryptContent.hashRefresh(newRefreshToken) },
      { where: { userId: user.userId } },
    );

    return { accessToken, refreshToken: newRefreshToken };
  }
}

export const authService = new AuthService();
