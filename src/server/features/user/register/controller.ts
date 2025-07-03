import { CreateAuthSessionService } from "../../auth/session/service";
import { RegisterUserService } from "./service";
import { CreateUserInput } from "@/server/schema/user.schema";
import { IAPIContextDTO } from "@/server/createContext";

const registerUserController = async ({
  input,
  ctx
}: {
  input: CreateUserInput;
  ctx: IAPIContextDTO;
}) => {
  const user = await RegisterUserService({
    ...input,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.user
    },
    helpers: ctx.helpers
  });

  const session = await CreateAuthSessionService({
    userId: user.id,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session,
      user: ctx.repositories.user
    },
    helpers: ctx.helpers
  });

  const { password, ...userWithoutPassword } = user;
  const { userId, ...sessionWithoutUserId } = session;

  return {
    ...sessionWithoutUserId,
    user: userWithoutPassword
  };
};

export { registerUserController };
