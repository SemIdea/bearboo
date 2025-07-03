import { TRPCError } from "@trpc/server";
import { IRegisterUserDTO } from "./DTO";
import { UserEntity } from "@/server/entities/user/entity";
import { UserErrorCode } from "@/shared/error/user";

const RegisterUserService = async ({
  repositories,
  helpers,
  ...data
}: IRegisterUserDTO) => {
  const existingUser = await UserEntity.readByEmail({
    ...data,
    repositories
  });

  if (existingUser) {
    throw new TRPCError({
      code: "CONFLICT",
      message: UserErrorCode.USER_ALREADY_EXISTS
    });
  }

  const userId = helpers.uid.generate();
  const hashedPassword = await helpers.hashing.hash(data.password);

  const user = await UserEntity.create({
    id: userId,
    data: {
      ...data,
      password: hashedPassword
    },
    repositories
  });

  return user;
};

export { RegisterUserService };
