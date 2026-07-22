import { authRepository } from "../authRepository.ts";

export async function checkExistence(email: string) {
  // check user existence
  const userExit = await authRepository.findOne({
    where: { email },
  });

  return userExit;
}
