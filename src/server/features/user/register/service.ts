import { TRPCError } from "@trpc/server";
import { IRegisterUserDTO } from "./DTO";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";
import { UserEntity } from "@/server/entities/user/entity";
import { UserErrorCode } from "@/shared/error/user";

const RegisterUserService = async ({
  repositories,
  ...data
}: IRegisterUserDTO) => {
  const existingUser = await UserEntity.readByEmail({
    email: data.email,
    repositories
  });

  if (existingUser) {
    throw new TRPCError({
      code: "CONFLICT",
      message: UserErrorCode.USER_ALREADY_EXISTS
    });
  }

  const userId = await GenerateSnowflakeUID();
  const hashedPassword = await repositories.hashing.hash(data.password);

  const user = await UserEntity.create({
    data: {
      ...data,
      password: hashedPassword
    },
    id: userId,
    repositories
  });

  return user;
};

export { RegisterUserService };
