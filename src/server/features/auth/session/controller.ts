import {
  FindSessionByRefreshTokenService,
  RefreshSessionService,
} from "./service";
import { IAPIContextDTO } from "@/server/createContext";
import { RefreshSessionInput } from "@/server/schema/session.schema";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";

const refreshSessionController = async ({
  input,
  ctx,
}: {
  input: RefreshSessionInput;
  ctx: IAPIContextDTO;
}) => {
  const session = await FindSessionByRefreshTokenService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session,
    },
    ...input,
  });

  const newAccessToken = await GenerateSnowflakeUID();
  const newRefreshToken = await GenerateSnowflakeUID();

  await RefreshSessionService({
    id: session.id,
    newAccessToken,
    newRefreshToken,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session,
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export { refreshSessionController };
