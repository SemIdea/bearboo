import { RegisterUserService } from "./service";

import { CreateUserInput } from "@/server/schema/user.schema";
import { PrismaUserModel } from "@/server/entities/user/repositories/prisma";
import { BycryptPasswordHashingHelper } from "@/server/integrations/helpers/passwordHashing/implementations/bycrypt";
import { RedisCacheRepository } from "@/server/integrations/helpers/cache/implementations/redis";

const registerUserController = async ({
  input,
}: {
  input: CreateUserInput;
}) => {
  const user = await RegisterUserService({
    repositories: {
      database: new PrismaUserModel(),
      cache: new RedisCacheRepository(),
      hashing: new BycryptPasswordHashingHelper(),
    },
    ...input,
  });

  return user;
};

export { registerUserController };
