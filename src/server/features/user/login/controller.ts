import { CreateAuthSessionService } from "../../auth/session/service";
import { LoginUserService } from "./service";
import { LoginUserInput } from "@/server/schema/user.schema";
import { IAPIContextDTO } from "@/server/createContext";

const loginUserController = async ({
  input,
  ctx,
}: {
  input: LoginUserInput;
  ctx: IAPIContextDTO;
}) => {
  const user = await LoginUserService({
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

export { loginUserController };
