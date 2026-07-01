import { ReadUserProfileService } from "../domain/readProfile";
import { IAPIContextDTO } from "@/server/createContext";
import { ReadUserProfileInput } from "../schema";

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
    ...input,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.user
    }
  });

  return profile;
};

export { readUserProfileController };
