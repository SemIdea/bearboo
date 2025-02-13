import { initTRPC, TRPCError } from "@trpc/server";

import { Context } from "./createContext";

const t = initTRPC.context<Context>().create();

const publicProcedure = t.procedure;

const protectedProcedure = t.procedure.use(function isAuthed(opts) {
  if (!opts.ctx.user?.email) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return opts.next({
    ctx: {
      user: opts.ctx.user,
    },
  });
});

export { t, publicProcedure, protectedProcedure };
