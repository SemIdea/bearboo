import { publicProcedure } from "@/server/createRouter";
import { CreateAuthSessionService } from "../../auth/domain/createAuthSession";
import { LoginUserService } from "../domain/login";
import { loginUserOutputSchema, loginUserSchema } from "../schema";

const loginUserProcedure = publicProcedure
  .input(loginUserSchema)
  .output(loginUserOutputSchema)
  .mutation(async ({ input, ctx }) => {
    const user = await LoginUserService({ ...input, ctx });
    const session = await CreateAuthSessionService({ userId: user.id, ctx });

    return {
      ...session,
      user
    };
  });

export { loginUserProcedure };
