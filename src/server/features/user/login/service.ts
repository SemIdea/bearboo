import { TRPCError } from "@trpc/server";
import { ILoginUserDTO } from "./DTO";
import { UserEntity } from "@/server/entities/user/entity";
import { AuthErrorCode } from "@/shared/error/auth";

const LoginUserService = async ({ repositories, ...data }: ILoginUserDTO) => {
  const { email, password } = data;

  const user = await UserEntity.findByEmail({
    email,
    repositories,
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: AuthErrorCode.USER_NOT_FOUD,
    });
  }

  if (!repositories.hashing.compare(user.password, password)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: AuthErrorCode.INVALID_CREDENTIALS,
    });
  }

  return user;
};

export { LoginUserService };
