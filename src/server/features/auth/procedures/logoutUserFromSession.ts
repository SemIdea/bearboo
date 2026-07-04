import { protectedProcedure } from "@/server/createRouter";
import { DeleteSessionService } from "../domain/deleteSession";
import { logoutUserFromSessionOutputSchema } from "../schema";

const logoutUserFromSessionProcedure = protectedProcedure
  .output(logoutUserFromSessionOutputSchema)
  .mutation(async ({ ctx }) => {
    const session = ctx.user.session;

    await DeleteSessionService({
      id: session.id,
      userId: ctx.user.id,
      ctx
    });
  });

export { logoutUserFromSessionProcedure };
