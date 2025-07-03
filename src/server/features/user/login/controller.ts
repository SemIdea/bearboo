import { CreateAuthSessionService } from "../../auth/session/service";
import { LoginUserService } from "./service";
import { LoginUserInput } from "@/server/schema/user.schema";
import { IAPIContextDTO } from "@/server/createContext";

const loginUserController = async ({
  input,
  ctx
}: {
  input: LoginUserInput;
  ctx: IAPIContextDTO;
}) => {
  const user = await LoginUserService({
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
      database: ctx.repositories.session
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

export { loginUserController };
