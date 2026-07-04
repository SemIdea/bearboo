import { TRPCError } from "@trpc/server";
import { IRegisterUserDTO } from "./register.dto";
import { UserErrorCode } from "@/shared/error/user";

const RegisterUserService = async ({
  repositories,
  helpers,
  ...data
}: IRegisterUserDTO) => {
  const existingUser = await repositories.database.readByEmail(data.email);

  if (existingUser) {
    throw new TRPCError({
      code: "CONFLICT",
      message: UserErrorCode.USER_ALREADY_EXISTS
    });
  }

  const userId = helpers.uid.generate();
  const hashedPassword = await helpers.hashing.hash(data.password);

  const user = await repositories.database.create(userId, {
    ...data,
    password: hashedPassword,
    verified: false
  });

  return user;
};

export { RegisterUserService };
