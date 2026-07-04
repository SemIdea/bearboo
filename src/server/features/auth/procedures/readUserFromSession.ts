import { protectedProcedure } from "@/server/createRouter";
import { readUserFromSessionOutputSchema } from "../schema";

const readUserFromSessionProcedure = protectedProcedure
  .output(readUserFromSessionOutputSchema)
  .query(async ({ ctx }) => ctx.user);

export { readUserFromSessionProcedure };
