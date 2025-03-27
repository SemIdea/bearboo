import { Session } from "@prisma/client";
import { CreateAuthSessionService } from "../../auth/session/service";
import { RegisterUserService } from "./service";
import { CreateUserInput } from "@/server/schema/user.schema";
import { IAPIContextDTO } from "@/server/createContext";

const registerUserController = async ({
  input,
  ctx,
}: {
  input: CreateUserInput;
  ctx: IAPIContextDTO;
}) => {
  const user = await RegisterUserService({
    repositories: {
      database: ctx.repositories.user,
      cache: ctx.repositories.cache,
      hashing: ctx.repositories.hashing,
    },
    ...input,
  });

  const session = await CreateAuthSessionService({
    repositories: {
      user: ctx.repositories.user,
      database: ctx.repositories.session,
      cache: ctx.repositories.cache,
    },
    userId: user.id,
  });

  const { password, ...userWithoutPassword } = user;
  const { userId, ...sessionWithoutUserId } = session;

  return {
    ...sessionWithoutUserId,
    user: userWithoutPassword,
  };
};

export { registerUserController };
