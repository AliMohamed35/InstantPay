import {
  BadRequestException,
  UserAlreadyActiveException,
  UserAlreadyExistException,
  UserNotFoundException,
} from "../../Exceptions/CustomExceptions/Exceptions.ts";
import {
  comparePassword,
  hashPassword,
} from "../../utilities/bcrypt/bcrypt.ts";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utilities/jwt/jwt.ts";
import { generateOTP } from "../../utilities/OTP/generateOTP.ts";
import { authRepository } from "./AuthRepository.ts";
import type { LoginDTO } from "./dto/LoginDTO.ts";
import type { RegisterDTO } from "./dto/RegisterDTO.ts";
import { checkExistence } from "./providers/checkExistence.ts";

class AuthService {
  // We need to add send OTP and resend OTP
  public async register(userData: RegisterDTO) {
    // check user existence
    const userExist = await checkExistence(userData.email);

    if (!userExist) {
      const hashedPassword = await hashPassword(userData.password);
      const hashedPin = await hashPassword(userData.pin);
      const { otp } = generateOTP();

      return authRepository.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        passwordHash: hashedPassword,
        isActive: 0,
        isVerified: 0,
        OTP: otp,
        pinHash: hashedPin,
      });
    } else {
      throw new UserAlreadyExistException("User already exist, please login!");
    }
  }

  // Login
  public async login(loginData: LoginDTO) {
    // check existence
    const userExist = await checkExistence(loginData.email);

    if(!userExist?.isVerified){
      throw new BadRequestException("User not verified!");
    }

    if (userExist) {
      const userId = userExist.userId;
      const matchedPassword = await comparePassword(
        loginData.password,
        userExist.passwordHash,
      );

      const accessToken = generateAccessToken(userId);
      const refreshToken = generateRefreshToken(userId);

      if (userExist.isActive) {
        throw new UserAlreadyActiveException("Already logged in!");
      }

      if (matchedPassword) {
        await authRepository.update(
          { isActive: 1, accessToken, refreshToken },
          { where: { email: userExist.email } },
        );
      }
    } else {
      throw new UserNotFoundException("User doesn't exist!");
    }
  }

  //logout
  public async logout(email: string) {
    const userExist = await checkExistence(email);

    if (!userExist) {
      throw new UserNotFoundException("User not found!");
    }

    if (userExist.isActive == 0) {
      throw new BadRequestException("User Already logged out!");
    }

    await authRepository.update({ isActive: 0 }, { where: { email } });

    return email;
  }

  // verifyOTP
  public async verifyOTP(email: string, otp: number) {
    const userExist = await checkExistence(email);

    if (!userExist) {
      throw new UserNotFoundException("User not found!");
    }

    if (userExist.OTP == otp) {
      await authRepository.update({ isVerified: 1, OTP: null }, { where: { email } });
    }

    return userExist;
  }

  // ResendOTP
  // Reset / forget password
  // Change password
}

export const authService = new AuthService();
