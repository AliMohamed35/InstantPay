import { UniqueConstraintError } from "sequelize";
import sequelize from "../../DB/connection.ts";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  UserAlreadyExistException,
} from "../../Exceptions/CustomExceptions/Exceptions.ts";
import {
  comparePassword,
  comparePin,
  hashPassword,
} from "../../utilities/bcrypt/bcrypt.ts";
import { generateReferenceNumber } from "../../utilities/referenceNumber.ts";
import { accountRepository } from "../Accounts/accountRepository.ts";
import { authRepository } from "../Auth/authRepository.ts";
import { toPublicUser } from "../Auth/providers/toPublicUser.ts";
import { ledgerRepository } from "../Ledger/ledgerRepository.ts";
import { transactionRepository } from "../Transactions/transactions.repository.ts";
import type { PartialUpdateDTO, UpdateUserDTO } from "./dto/updateDTO.ts";
import { userRepository } from "./user.repository.ts";
import { checkExistence } from "../Auth/providers/checkExistence.ts";
import { generateOTP } from "../../utilities/OTP/generateOTP.ts";
import { sendOtpEmail } from "../../utilities/mail/mailer.ts";

class UserService {
  // Change password
  public async changePassword(
    userId: any,
    oldPassword: string,
    newPassword: string,
  ) {
    const userExist = await authRepository.findById(userId);

    if (!userExist) {
      throw new NotFoundException("user doesn't exist!");
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

  // forget password
  public async forgetPassword(email: string) {
    const userExist = await checkExistence(email);

    if (!userExist) throw new NotFoundException("User not found!");

    const { otp, otpExpire } = generateOTP();

    await authRepository.update(
      {
        otpHash: await hashPassword(otp),
        otpExpire,
        otpAttempts: 0,
      },
      { where: { email } },
    );

    await sendOtpEmail(email, otp);

    return { email };
  }

  // reset password
  public async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await checkExistence(email);

    if (!user) {
      throw new NotFoundException("user doesn't exist!");
    }

    if (!user.otpHash || !user.otpExpire)
      throw new BadRequestException(
        "There is not reset pending, request a new code!",
      );

    if (user.otpExpire < new Date()) {
      throw new BadRequestException(
        "There is not reset pending, request a new code!",
      );
    }

    if (user.otpAttempts >= 5) {
      throw new BadRequestException("Too many attempts, request a new code!");
    }

    const ok = await comparePassword(newPassword, user.passwordHash);
    if (!ok) {
      await authRepository.increment("otpAttempts", { where: { email } });
      throw new BadRequestException("Code doesn't match");
    }

    await authRepository.update(
      {
        passwordHash: await hashPassword(newPassword),
        otpHash: null,
        otpExpire: null,
        otpAttempts: 0,
        refreshToken: null,
      },
      { where: { email } },
    );
    return { email };
  }

  // Soft delete user
  public async softDeleteUser(userId: any) {
    const userExist = await authRepository.findById(userId);

    if (!userExist) {
      throw new NotFoundException("user doesn't exist!");
    }

    if (userExist.isDeleted) {
      throw new NotFoundException(
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
      throw new NotFoundException("User not found!");
    }

    return toPublicUser(userExist);
  }

  // Fully update user
  public async fullyUpdateUser(userId: any, userData: UpdateUserDTO) {
    // check user existence
    const userExist = await authRepository.findById(userId);
    if (!userExist) throw new NotFoundException("User Not Found!");

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
      throw new NotFoundException("user not found!");
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

  // check balance
  public async checkBalance(requestedUser: any, accountId: any, pin: string) {
    // validate pin
    const user = await userRepository.findById(requestedUser);
    if (!user) throw new NotFoundException("user not found!");

    const matched = await comparePin(pin, user.pinHash);
    if (!matched) throw new UnauthorizedException("Invalid PIN!");
    // check ownership
    // check account existence
    const accountExist = await accountRepository.findById(accountId);
    if (!accountExist) throw new NotFoundException("Account doesn't exist");
    if (accountExist?.userId !== requestedUser)
      throw new UnauthorizedException("Not your account!");

    // check account balance
    const balance: number = accountExist.balance;
    return balance;
  }

  // recharge just simulation for user to add fake balance
  public async recharge(requestedUser: any, accountId: any, amount: number) {
    // check ownership
    // check account existence
    const accountExist = await accountRepository.findById(accountId);
    if (!accountExist) throw new NotFoundException("Account doesn't exist");

    if (accountExist?.userId !== requestedUser)
      throw new UnauthorizedException("Not your account!");

    // check if amount is positive
    if (amount <= 0)
      throw new BadRequestException("Amount can't be negative or zero");

    return await accountRepository.update(
      { balance: amount },
      { where: { accountId } },
    );
  }

  public async transferToUser(
    userId: string,
    senderAccountId: string,
    receiverAccountId: string,
    amount: number,
    pin: string,
  ) {
    // validate pin
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundException("user not found!");

    const matched = await comparePin(pin, user.pinHash);
    if (!matched) throw new UnauthorizedException("Invalid PIN!");

    // cheap validation
    if (senderAccountId === receiverAccountId)
      throw new BadRequestException("Cannot transfer to the same account");
    if (typeof amount !== "number" || amount <= 0)
      throw new BadRequestException("Amount must be positive");

    return await sequelize.transaction(async (t) => {
      // locking both rows
      const sender = await accountRepository.findById(senderAccountId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const receiver = await accountRepository.findById(receiverAccountId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      // check existence
      if (!sender) throw new NotFoundException("Sender account doesn't exist");
      if (!receiver)
        throw new NotFoundException("Receiver account doesn't exist");

      // ownership
      if (sender.userId !== userId)
        throw new UnauthorizedException("Not your account!");

      // business rules
      if (sender.currency !== receiver.currency)
        throw new BadRequestException("Currency mismatch!");
      if (amount > sender.balance)
        throw new BadRequestException("Insufficient balance!");

      // header
      const transaction = await transactionRepository.create(
        {
          referenceNumber: generateReferenceNumber(),
          initiatedByAccountId: senderAccountId,
          type: "TRANSFER",
          status: "PENDING",
        },
        { transaction: t },
      );

      await ledgerRepository.create(
        {
          transactionId: transaction.transactionId,
          accountId: receiverAccountId,
          amount: amount,
        },
        { transaction: t },
      );

      await ledgerRepository.create(
        {
          transactionId: transaction.transactionId,
          accountId: senderAccountId,
          amount: -amount,
        },
        { transaction: t },
      );

      await accountRepository.increment("balance", {
        by: amount,
        where: { accountId: receiverAccountId },
        transaction: t,
      });

      await accountRepository.increment("balance", {
        by: -amount,
        where: { accountId: senderAccountId },
        transaction: t,
      });

      await transactionRepository.update(
        { status: "COMPLETED" },
        { where: { transactionId: transaction.transactionId }, transaction: t },
      );

      return {
        referenceNumber: transaction.referenceNumber,
        amount: amount,
        status: "COMPLETED",
      };
    });
  }

  // transfer from account to another one
}

export const userService = new UserService();
