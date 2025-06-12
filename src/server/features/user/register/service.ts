import { TRPCError } from "@trpc/server";
import { IRegisterUserDTO } from "./DTO";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";
import { UserEntity } from "@/server/entities/user/entity";
import { UserErrorCode } from "@/shared/error/user";

const RegisterUserService = async ({
  repositories,
  ...data
}: IRegisterUserDTO) => {
  const { email, password } = data;

  const existingUser = await UserEntity.findByEmail({
    email,
    repositories
  });

  if (existingUser) {
    throw new TRPCError({
      code: "CONFLICT",
      message: UserErrorCode.USER_ALREADY_EXISTS
    });
  }

  const userId = await GenerateSnowflakeUID();
  const hashedPassword = await repositories.hashing.hash(password);

  const user = await UserEntity.create({
    data: {
      email,
      password: hashedPassword
    },
    id: userId,
    repositories
  });

  return user;
};

export { RegisterUserService };
