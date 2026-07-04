import { TRPCError } from "@trpc/server";
import { IUserModel } from "@/server/models/user";
import { IPasswordHashingHelperAdapter } from "@/lib/passwordHashing/adapter";
import { AuthErrorCode } from "@/shared/error/auth";
import { UserErrorCode } from "@/shared/error/user";
import { LoginUserInput } from "../schema";

type Params = LoginUserInput & {
  repositories: {
    database: IUserModel;
  };
  helpers: {
    hashing: IPasswordHashingHelperAdapter;
  };
};

const LoginUserService = async ({ repositories, helpers, ...data }: Params) => {
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
