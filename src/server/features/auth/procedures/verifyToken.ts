import { publicProcedure } from "@/server/createRouter";
import { VerifyTokenService } from "../domain/verifyToken";
import { verifyTokenSchema, verifyTokenOutputSchema } from "../schema";

const verifyTokenProcedure = publicProcedure
  .input(verifyTokenSchema)
  .output(verifyTokenOutputSchema)
  .mutation(async ({ input, ctx }) => VerifyTokenService({ ...input, ctx }));

export { verifyTokenProcedure };
