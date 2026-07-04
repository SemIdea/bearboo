import { publicProcedure } from "@/server/createRouter";
import { ResetPasswordService } from "../domain/resetPassword";
import { resetPasswordSchema, resetPasswordOutputSchema } from "../schema";

const resetPasswordProcedure = publicProcedure
  .input(resetPasswordSchema)
  .output(resetPasswordOutputSchema)
  .mutation(async ({ input, ctx }) =>
    ResetPasswordService({
      token: input.token,
      newPassword: input.password,
      ctx
    })
  );

export { resetPasswordProcedure };
