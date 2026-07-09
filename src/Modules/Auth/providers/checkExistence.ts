import { UserAlreadyExistException, UserNotFoundException } from "../../../Exceptions/CustomExceptions/Exceptions.ts";
import { authRepository } from "../authRepository.ts";

export async function checkExistence(email: string) {
  // check user existence
  const userExit = await authRepository.findOne({
    where: { email },
  });

  return userExit;
}
