import { hashPassword } from "../../utilities/bcrypt/bcrypt.ts";
import { authRepository } from "./AuthRepository.ts";
import type { RegisterDTO } from "./dto/RegisterDTO.ts";
import { checkExistence } from "./providers/checkExistence.ts";

class AuthService {
  public async register(userData: RegisterDTO) {
    // check user existence
    const userExist = checkExistence(userData.email);

    console.log(userExist);
    

    if (await userExist) {
      throw new Error("User already exist");
    }

    const hashedPassword = await hashPassword(userData.passwordHash);
    const hashedPin = await hashPassword(userData.pinHash);

    return authRepository.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      email: userData.email,
      passwordHash: hashedPassword,
      pinHash: hashedPin,
    });
  }
}

export const authService = new AuthService();
