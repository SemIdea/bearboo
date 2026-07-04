import { verifiedProcedure } from "@/server/createRouter";
import { RevalidatePostService } from "../domain/revalidate";
import { revalidatePostSchema, revalidatePostOutputSchema } from "../schema";

const revalidatePostProcedure = verifiedProcedure
  .input(revalidatePostSchema)
  .output(revalidatePostOutputSchema)
  .mutation(async ({ input, ctx }) =>
    RevalidatePostService({ ...input, userId: ctx.user.id, ctx })
  );

export { revalidatePostProcedure };
