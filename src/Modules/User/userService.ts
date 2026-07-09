import {
  BadRequestException,
  UserNotFoundException,
} from "../../Exceptions/CustomExceptions/Exceptions.ts";
import {
  comparePassword,
  hashPassword,
} from "../../utilities/bcrypt/bcrypt.ts";
import { authRepository } from "../Auth/authRepository.ts";

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
      { passwordHash: newPass, isActive: 0 },
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
      { isActive: 0, isDeleted: 1 },
      { where: { email: userExist.email } },
    );
  }
  // Delete user
  public async deleteUser(userId: any) {
    const userExist = await authRepository.findById(userId);

    if (!userExist) {
      throw new UserNotFoundException("user doesn't exist!");
    }

    return await authRepository.delete({ where: { email: userExist.email } });
  }

  // Fully update user
  // Partial update user
}

export const userService = new UserService();
