import { DeleteSessionService } from "../domain/deleteSession";
import { IProtectedAPIContextDTO } from "@/server/createContext";

const logoutUserFromSessionController = async ({
  ctx
}: {
  ctx: IProtectedAPIContextDTO;
}) => {
  const session = ctx.user.session;

  await DeleteSessionService({
    ...session,
    userId: ctx.user.id,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session
    }
  });
};

export { logoutUserFromSessionController };
