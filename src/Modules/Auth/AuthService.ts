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

    await authRepository.update(
      { isActive: 1, accessToken, refreshToken, isDeleted: 0 },
      { where: { email: userExist.email } },
    );

    return { userId: userExist.userId, accessToken, refreshToken };
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
      await authRepository.update(
        { isVerified: 1, OTP: null },
        { where: { email } },
      );
    }

    return userExist;
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

    const { otp } = generateOTP();

    return await authRepository.update({ OTP: otp }, { where: { email } });
  }

  // Reset / forget password
  // check email existence
  // send email or sms to user phoneNumber
  // then update the password in database with the new one

  // Change password
  public async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const userExist = await checkExistence(email);

    if (!userExist) {
      throw new UserNotFoundException("user doesn't exist!");
    }

    // Enter your pin too change password

    // Compare new to old
    const match = await comparePassword(oldPassword, userExist.passwordHash);

    if (!match) {
      throw new BadRequestException("Password doesn't match!");
    }

    const newPass = await hashPassword(newPassword);

    const updatedUser = await authRepository.update(
      { passwordHash: newPass, isActive: 0 },
      { where: { email } },
    );

    return updatedUser;
  }

  // Soft delete user
  public async softDeleteUser(email: string) {
    const userExist = await checkExistence(email);

    if (!userExist) {
      throw new UserNotFoundException("user doesn't exist!");
    }

    if (userExist.isDeleted) {
      throw new UserNotFoundException(
        "user already soft deleted, log in to retrieve the account!",
      );
    }

    return await authRepository.update(
      { isActive: 0, isDeleted: 1 },
      { where: { email } },
    );
  }
  // Delete user
  public async deleteUser(email: string) {
    const userExist = await checkExistence(email);

    if (!userExist) {
      throw new UserNotFoundException("user doesn't exist!");
    }

    if (userExist.isDeleted) {
      throw new UserNotFoundException(
        "user already soft deleted, log in to retrieve the account!",
      );
    }

    return await authRepository.delete({ where: { email } });
  }

  // Fully update user
  // Partial update user
}

export const authService = new AuthService();
