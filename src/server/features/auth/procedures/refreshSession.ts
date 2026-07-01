import { ReadSessionByRefreshTokenService } from "../domain/readSessionByRefreshToken";
import { RefreshSessionService } from "../domain/refreshSession";
import { IAPIContextDTO } from "@/server/createContext";
import { RefreshSessionInput } from "../schema";

const refreshSessionController = async ({
  input,
  ctx
}: {
  input: RefreshSessionInput;
  ctx: IAPIContextDTO;
}) => {
  const session = await ReadSessionByRefreshTokenService({
    ...input,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session
    }
  });

  const newSession = await RefreshSessionService({
    ...session,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session
    },
    helpers: ctx.helpers
  });

  return newSession;
};

export { refreshSessionController };
