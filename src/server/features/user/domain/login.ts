import { TRPCError } from "@trpc/server";
import { ILoginUserDTO } from "./login.dto";
import { AuthErrorCode } from "@/shared/error/auth";
import { UserErrorCode } from "@/shared/error/user";

const LoginUserService = async ({
  repositories,
  helpers,
  ...data
}: ILoginUserDTO) => {
  const { email, password } = data;

  const user = await repositories.database.readByEmail(email);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const isSamePassword = await helpers.hashing.compare(password, user.password);

  if (!isSamePassword) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: AuthErrorCode.INVALID_CREDENTIALS
    });
  }

  return user;
};

export { LoginUserService };
