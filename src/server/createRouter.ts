import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { Context } from "./createContext";
import { AuthErrorCode } from "@/shared/error/auth";
import { SessionErrorCode } from "@/shared/error/session";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null
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
      message: SessionErrorCode.SESSION_EXPIRED
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
      message: AuthErrorCode.USER_NOT_LOGGED_IN
    });
  }

  return next({
    ctx: {
      user: ctx.user
    }
  });
});

const verifiedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user.verified) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: AuthErrorCode.USER_NOT_VERIFIED
    });
  }

  return next({
    ctx: {
      user: ctx.user
    }
  });
});

export { t, publicProcedure, protectedProcedure, verifiedProcedure };
