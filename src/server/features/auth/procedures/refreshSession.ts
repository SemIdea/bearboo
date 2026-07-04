import { t } from "@/server/createRouter";
import { ReadSessionByRefreshTokenService } from "../domain/readSessionByRefreshToken";
import { RefreshSessionService } from "../domain/refreshSession";
import { refreshSessionSchema, refreshSessionOutputSchema } from "../schema";

const refreshSessionProcedure = t.procedure
  .input(refreshSessionSchema)
  .output(refreshSessionOutputSchema)
  .mutation(async ({ input, ctx }) => {
    const session = await ReadSessionByRefreshTokenService({ ...input, ctx });

    return RefreshSessionService({ id: session.id, ctx });
  });

export { refreshSessionProcedure };
