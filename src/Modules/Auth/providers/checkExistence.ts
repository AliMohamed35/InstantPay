import { authRepository } from "../AuthRepository.ts";

export async function checkExistence(email: string) {
  // check user existence
  const userExit = await authRepository.findOne({
    where: { email },
  });

  return userExit;
}
