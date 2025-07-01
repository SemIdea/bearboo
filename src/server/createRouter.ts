import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { Context } from "./createContext";
import { AuthErrorCode } from "@/shared/error/auth";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
      }
    };
  }
});

const publicProcedure = t.procedure.use(async ({ ctx, next }) => {
  const user = ctx.user;

  if (!user) return next();
  if (!user.session) return next();

  const sessionUpdatedTimestamp = user.session.updatedAt;

  if (!sessionUpdatedTimestamp) return next();

  const sessionUpdatedDate = new Date(sessionUpdatedTimestamp);
  const EXPIRES = 1000 * 20;

  if (Date.now() - sessionUpdatedDate.getTime() > EXPIRES) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: AuthErrorCode.SESSION_EXPIRED
    });
  }

  return next({
    ctx: {
      user: user
    }
  });
});

const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized"
    });
  }

  return next({
    ctx: {
      user: ctx.user
    }
  });
});

export { t, publicProcedure, protectedProcedure };
