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
      ...ctx.repositories,
      database: ctx.repositories.user,
    },
    ...input,
  });

  const session = await CreateAuthSessionService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session,
      user: ctx.repositories.user,
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
