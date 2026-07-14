import { UniqueConstraintError } from "sequelize";
import {
  BadRequestException,
  UserAlreadyExistException,
  UserNotFoundException,
} from "../../Exceptions/CustomExceptions/Exceptions.ts";
import {
  comparePassword,
  hashPassword,
} from "../../utilities/bcrypt/bcrypt.ts";
import { authRepository } from "../Auth/authRepository.ts";
import { toPublicUser } from "../Auth/providers/toPublicUser.ts";
import type { PartialUpdateDTO, UpdateUserDTO } from "./dto/updateDTO.ts";
import { userRepository } from "./userRepository.ts";

class UserService {
  // Change password
  public async changePassword(
    userId: any,
    oldPassword: string,
    newPassword: string,
  ) {
    const userExist = await authRepository.findById(userId);

    if (!userExist) {
      throw new UserNotFoundException("user doesn't exist!");
    }

    // Compare new to old
    const match = await comparePassword(oldPassword, userExist.passwordHash);

    if (!match) {
      throw new BadRequestException("Password doesn't match!");
    }

    const newPass = await hashPassword(newPassword);

    return await authRepository.update(
      { passwordHash: newPass, refreshToken: null },
      { where: { email: userExist.email } },
    );
  }

  // Soft delete user
  public async softDeleteUser(userId: any) {
    const userExist = await authRepository.findById(userId);

    if (!userExist) {
      throw new UserNotFoundException("user doesn't exist!");
    }

    if (userExist.isDeleted) {
      throw new UserNotFoundException(
        "user already soft deleted, log in to retrieve the account!",
      );
    }

    return await authRepository.update(
      { isDeleted: 1 },
      { where: { email: userExist.email } },
    );
  }

  // getSpecificUser
  public async getSpecificUser(userId: any) {
    const userExist = await authRepository.findById(userId);

    if (!userExist) {
      throw new UserNotFoundException("User not found!");
    }

    return toPublicUser(userExist);
  }

  // Fully update user
  public async fullyUpdateUser(userId: any, userData: UpdateUserDTO) {
    // check user existence
    const userExist = await authRepository.findById(userId);
    if (!userExist) throw new UserNotFoundException("User Not Found!");

    const payload: Record<string, unknown> = { ...userData };

    if (userData.email && userData.email !== userExist.email) {
      payload.isVerified = 0;
    }

    try {
      const [affectedCount] = await userRepository.update(payload, {
        where: { userId },
      });
      if (affectedCount === 0) {
        throw new BadRequestException("No changes made");
      }
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new UserAlreadyExistException("Email is already in use!");
      }
      throw error;
    }

    return { message: "user updated successfully" };
  }

  // Partial update user
  public async partialUpdateUser(userId: any, userField: PartialUpdateDTO) {
    const userExist = await authRepository.findById(userId);

    if (!userExist) {
      throw new UserNotFoundException("user not found!");
    }

    const payload: Partial<UpdateUserDTO> & { isVerified?: number } = {
      ...userField,
    };

    if (userField.email !== undefined && userField.email !== userExist.email) {
      payload.isVerified = 0;
    }

    const [affectedCount] = await userRepository.update(payload, {
      where: { userId },
    });

    if (affectedCount == 0) {
      throw new BadRequestException("No changes made");
    }

    return { message: "user updated successfully" };
  }
}

export const userService = new UserService();
