import { TRPCError } from "@trpc/server";
import { IUserModel } from "@/server/models/user";
import { IPasswordHashingHelperAdapter } from "@/lib/passwordHashing/adapter";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";
import { UserErrorCode } from "@/shared/error/user";
import { CreateUserInput } from "../schema";

type Params = CreateUserInput & {
  repositories: {
    database: IUserModel;
  };
  helpers: {
    hashing: IPasswordHashingHelperAdapter;
    uid: IUidGeneratorHelperAdapter;
  };
};

const RegisterUserService = async ({
  repositories,
  helpers,
  ...data
}: Params) => {
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
