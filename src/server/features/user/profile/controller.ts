import { ReadUserProfileService } from "./service";
import { IAPIContextDTO } from "@/server/createContext";
import { ReadUserProfileInput } from "@/server/schema/user.schema";

const readUserProfileController = async ({
  input,
  ctx
}: {
  input: ReadUserProfileInput;
  ctx: IAPIContextDTO;
}) => {
  if (ctx.user && input.id == ctx.user.id) {
    const { session, ...userWithoutSession } = ctx.user;

    return userWithoutSession;
  }

  const profile = await ReadUserProfileService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.user
    },
    ...input
  });

  return profile;
};

export { readUserProfileController };
