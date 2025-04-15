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
    email: input.email,
    password: input.email,
    repositories: {
      database: ctx.repositories.user,
      cache: ctx.repositories.cache,
      hashing: ctx.repositories.hashing,
    },
  });

  const session = await CreateAuthSessionService({
    userId: user.id,
    repositories: {
      user: ctx.repositories.user,
      database: ctx.repositories.session,
      cache: ctx.repositories.cache,
    },
  });

  const { password, ...userWithoutPassword } = user;
  const { userId, ...sessionWithoutUserId } = session;

  return {
    ...sessionWithoutUserId,
    user: userWithoutPassword,
  };
};

export { loginUserController };
