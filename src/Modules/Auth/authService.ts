import { UniqueConstraintError } from "sequelize";
import {
  BadRequestException,
  UnauthorizedException,
  UserAlreadyExistException,
  NotFoundException,
} from "../../Exceptions/CustomExceptions/Exceptions.ts";
import * as bcryptContent from "../../utilities/bcrypt/bcrypt.ts";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utilities/jwt/jwt.ts";
import { generateOTP } from "../../utilities/OTP/generateOTP.ts";
import { authRepository } from "./authRepository.ts";
import type { LoginDTO } from "./dto/LoginDTO.ts";
import type { RegisterDTO, RegisterResponseDTO } from "./dto/RegisterDTO.ts";
import { checkExistence } from "./providers/checkExistence.ts";
import { toPublicUser } from "./providers/toPublicUser.ts";
import { sendOtpEmail } from "../../utilities/mail/mailer.ts";
import { sha256 } from "../../utilities/hash/sha256.ts";

class AuthService {
  // We need to add send OTP and resend OTP
  public async register(userData: RegisterDTO): Promise<RegisterResponseDTO> {
    const hashedPassword = await bcryptContent.hashPassword(userData.password);
    const hashedPin = await bcryptContent.hashPassword(userData.pin);
    const { otp, otpExpire } = generateOTP();

    try {
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
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new UserAlreadyExistException(
          "User already exist, please login!",
        );
      }
      throw error;
    }
    await sendOtpEmail(userData.email, otp);
    return {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      email: userData.email,
    };
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

    await authRepository.update(
      { refreshToken: sha256(refreshToken), isDeleted: 0 },
      { where: { email: userExist.email } },
    );

    return { userId: userExist.userId, accessToken, refreshToken };
  }

  //logout
  public async logout(userId: any) {
    // findUserById
    const userExist = await authRepository.findById(userId);

    if (!userExist) {
      throw new NotFoundException("User not found!");
    }

    await authRepository.update(
      { refreshToken: null },
      { where: { email: userExist.email } },
    );

    return { userId: userExist.userId };
  }

  // refresh
  public async refresh(rawToken?: string) {
    if (!rawToken) throw new UnauthorizedException("No refresh Token!");

    let payload;
    try {
      payload = verifyRefreshToken(rawToken);
    } catch (error) {
      throw new UnauthorizedException("Session expired, please login again");
    }

    const oldHash = sha256(rawToken);
    const newRefreshToken = generateRefreshToken(payload.userId);
    const newHash = sha256(newRefreshToken);

    const [affected] = await authRepository.update(
      { refreshToken: newHash },
      {
        where: { userId: payload.userId, refreshToken: oldHash, isDeleted: 0 },
      },
    );

    if (affected === 0) {
      throw new UnauthorizedException(
        "Invalid or expired session, please login again",
      );
    }

    const accessToken = generateAccessToken(payload.userId);
    return {userId: payload.userId, accessToken, refreshToken: newRefreshToken};
  }

  // verifyOTP
  public async verifyOTP(email: string, otp: any) {
    const userExist = await checkExistence(email);

    if (!userExist) {
      throw new NotFoundException("User not found!");
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
      await authRepository.increment("otpAttempts", { where: { email } });
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
      throw new NotFoundException("User not found!");
    }

    if (userExist.isVerified) {
      throw new BadRequestException("User already verified!");
    }

    const { otp, otpExpire } = generateOTP();

    await authRepository.update(
      {
        otpHash: await bcryptContent.hashPassword(otp),
        otpExpire,
        otpAttempts: 0,
      },
      { where: { email } },
    );
    await sendOtpEmail(email, otp);
    return { email };
  }

  // Reset / forget password
  // check email existence
  // send email or sms to user phoneNumber
  // then update the password in database with the new one
}

export const authService = new AuthService();
